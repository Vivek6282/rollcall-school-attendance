from datetime import date, timedelta
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Classroom, Attendance, LeaveRequest
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, ClassroomSerializer, AttendanceSerializer, LeaveRequestSerializer

class CustomTokenObtainPairView(TokenObtainPairView): serializer_class = CustomTokenObtainPairSerializer
class MeView(APIView):
    def get(self, request): return Response(UserSerializer(request.user).data)

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    def get_queryset(self):
        u = self.request.user
        qs = User.objects.all().select_related("classroom") if u.role == "admin" else (User.objects.filter(role="student", classroom__teacher=u).select_related("classroom") if u.role == "teacher" else User.objects.none())
        r, c = self.request.query_params.get("role"), self.request.query_params.get("classroom")
        if r: qs = qs.filter(role=r)
        if c: qs = qs.filter(classroom_id=c)
        return qs.order_by("username")
    def check_permissions(self, req):
        super().check_permissions(req)
        if req.user.role == "teacher" and req.method not in ["GET", "HEAD", "OPTIONS"]: raise PermissionDenied("Teachers cannot modify users.")
        if req.user.role == "student": raise PermissionDenied("Students cannot view user lists.")

class ClassroomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassroomSerializer
    def get_queryset(self):
        u = self.request.user
        if u.role == "admin": return Classroom.objects.all().select_related("teacher")
        if u.role == "teacher": return Classroom.objects.filter(teacher=u).select_related("teacher")
        return Classroom.objects.filter(id=u.classroom_id).select_related("teacher") if (u.role == "student" and u.classroom_id) else Classroom.objects.none()
    def check_permissions(self, req):
        super().check_permissions(req)
        if req.user.role != "admin" and req.method not in ["GET", "HEAD", "OPTIONS"]: raise PermissionDenied("Only admins can modify classes.")

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    def get_queryset(self):
        u = self.request.user
        qs = Attendance.objects.all() if u.role == "admin" else (Attendance.objects.filter(classroom__teacher=u) if u.role == "teacher" else (Attendance.objects.filter(student=u) if u.role == "student" else Attendance.objects.none()))
        c, d, s = self.request.query_params.get("classroom"), self.request.query_params.get("date"), self.request.query_params.get("student")
        if c: qs = qs.filter(classroom_id=c)
        if d: qs = qs.filter(date=d)
        if s: qs = qs.filter(student_id=s)
        return qs.select_related("student", "classroom")
    def perform_create(self, ser):
        u = self.request.user
        if u.role == "student": raise PermissionDenied("Students cannot mark attendance.")
        if u.role == "teacher" and ser.validated_data.get("classroom").teacher != u: raise PermissionDenied("Not your class.")
        ser.save(marked_by=u)
    def check_permissions(self, req):
        super().check_permissions(req)
        if req.user.role == "student" and req.method not in ["GET", "HEAD", "OPTIONS"]: raise PermissionDenied("Students cannot mark attendance.")
    @action(detail=False, methods=["post"])
    def bulk(self, request):
        u = request.user
        if u.role == "student": raise PermissionDenied("Students cannot mark attendance.")
        cid, dt, recs = request.data.get("classroom"), request.data.get("date"), request.data.get("records", [])
        cls_obj = get_object_or_404(Classroom, id=cid)
        if u.role == "teacher" and cls_obj.teacher != u: raise PermissionDenied("You can only mark attendance for your own class.")
        with transaction.atomic():
            for r in recs:
                Attendance.objects.update_or_create(student_id=r["student"], date=dt, defaults={"classroom": cls_obj, "status": r["status"], "marked_by": u})
        return Response({"status": "saved", "count": len(recs)})

class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        u = self.request.user
        qs = LeaveRequest.objects.all() if u.role == "admin" else (LeaveRequest.objects.filter(student__classroom__teacher=u) if u.role == "teacher" else (LeaveRequest.objects.filter(student=u) if u.role == "student" else LeaveRequest.objects.none()))
        return qs.select_related("student", "student__classroom")
    def perform_create(self, ser):
        u = self.request.user
        if u.role == "student": ser.save(student=u)
        elif u.role == "admin": ser.save()
        else: raise PermissionDenied("Teachers cannot create leave requests.")
    def perform_update(self, ser):
        u = self.request.user
        if u.role == "student": raise PermissionDenied("Students cannot modify leave requests.")
        inst = ser.save()
        if inst.status == "approved" and inst.student.classroom:
            Attendance.objects.update_or_create(student=inst.student, date=inst.date, defaults={"classroom": inst.student.classroom, "status": "excused", "marked_by": u})
    def perform_destroy(self, inst):
        if self.request.user.role != "admin": raise PermissionDenied("Only admin can delete leaves.")
        inst.delete()

class AnalyticsView(APIView):
    def get(self, request):
        if request.user.role != "admin": raise PermissionDenied("Admin only.")
        agg = Attendance.objects.aggregate(tot=Count("id"), pres=Count("id", filter=Q(status="present")), late=Count("id", filter=Q(status="late")), exc=Count("id", filter=Q(status="excused")))
        tot = agg["tot"] or 0
        overall = round(((agg["pres"] or 0) + (agg["late"] or 0) + (agg["exc"] or 0)) / tot * 100, 1) if tot else 0.0
        totals = {"students": User.objects.filter(role="student").count(), "teachers": User.objects.filter(role="teacher").count(), "classes": Classroom.objects.count(), "records": tot, "overall_rate": overall}
        students = User.objects.filter(role="student").annotate(tot=Count("attendance"), pres=Count("attendance", filter=Q(attendance__status="present")), ab=Count("attendance", filter=Q(attendance__status="absent")), late=Count("attendance", filter=Q(attendance__status="late")), exc=Count("attendance", filter=Q(attendance__status="excused"))).select_related("classroom")
        per_student = [{"id": s.id, "name": s.get_full_name() or s.username, "classroom": s.classroom.name if s.classroom else "-", "present": s.pres, "absent": s.ab, "late": s.late, "excused": s.exc, "rate": round((s.pres + s.late + s.exc) / s.tot * 100, 1) if s.tot else 0.0} for s in students]
        classes = Classroom.objects.annotate(tot=Count("attendance"), pres=Count("attendance", filter=Q(attendance__status="present")), late=Count("attendance", filter=Q(attendance__status="late")), exc=Count("attendance", filter=Q(attendance__status="excused")))
        per_class = [{"name": c.name, "rate": round((c.pres + c.late + c.exc) / c.tot * 100, 1) if c.tot else 0.0} for c in classes]
        start_date = date.today() - timedelta(days=29)
        trend_qs = Attendance.objects.filter(date__gte=start_date).values("date").annotate(tot=Count("id"), pres=Count("id", filter=Q(status="present")), late=Count("id", filter=Q(status="late")), exc=Count("id", filter=Q(status="excused"))).order_by("date")
        trend = [{"date": t["date"].strftime("%Y-%m-%d"), "rate": round((t["pres"] + t["late"] + t["exc"]) / t["tot"] * 100, 1) if t["tot"] else 0.0} for t in trend_qs]
        return Response({"totals": totals, "per_student": per_student, "per_class": per_class, "trend": trend})

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("classes", ClassroomViewSet, basename="class")
router.register("attendance", AttendanceViewSet, basename="attendance")
router.register("leaves", LeaveRequestViewSet, basename="leave")
