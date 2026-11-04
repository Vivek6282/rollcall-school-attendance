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
from .models import User, Classroom, Subject, Attendance, LeaveRequest
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, ClassroomSerializer, SubjectSerializer, AttendanceSerializer, LeaveRequestSerializer

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
        if u.role == "admin": return Classroom.objects.all().select_related("teacher").prefetch_related("subjects")
        if u.role == "teacher": return Classroom.objects.filter(teacher=u).select_related("teacher").prefetch_related("subjects")
        return Classroom.objects.filter(id=u.classroom_id).select_related("teacher").prefetch_related("subjects") if (u.role == "student" and u.classroom_id) else Classroom.objects.none()
    def check_permissions(self, req):
        super().check_permissions(req)
        if req.user.role != "admin" and req.method not in ["GET", "HEAD", "OPTIONS"]: raise PermissionDenied("Only admins can modify classes.")

class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    def get_queryset(self):
        u = self.request.user
        if u.role == "admin": return Subject.objects.all()
        if u.role == "teacher": return Subject.objects.filter(classroom__teacher=u)
        return Subject.objects.filter(classroom_id=u.classroom_id) if (u.role == "student" and u.classroom_id) else Subject.objects.none()
    def check_permissions(self, req):
        super().check_permissions(req)
        if req.user.role != "admin" and req.method not in ["GET", "HEAD", "OPTIONS"]: raise PermissionDenied("Only admins can manage subjects.")

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    def get_queryset(self):
        u = self.request.user
        qs = Attendance.objects.all() if u.role == "admin" else (Attendance.objects.filter(classroom__teacher=u) if u.role == "teacher" else (Attendance.objects.filter(student=u) if u.role == "student" else Attendance.objects.none()))
        c, d, s, sub = self.request.query_params.get("classroom"), self.request.query_params.get("date"), self.request.query_params.get("student"), self.request.query_params.get("subject")
        if c: qs = qs.filter(classroom_id=c)
        if d: qs = qs.filter(date=d)
        if s: qs = qs.filter(student_id=s)
        if sub: qs = qs.filter(subject_id=sub)
        return qs.select_related("student", "classroom", "subject")
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
        cid, sub_id, dt, recs = request.data.get("classroom"), request.data.get("subject"), request.data.get("date"), request.data.get("records", [])
        cls_obj = get_object_or_404(Classroom, id=cid)
        if u.role == "teacher" and cls_obj.teacher != u: raise PermissionDenied("You can only mark attendance for your own class.")
        sub_obj = Subject.objects.filter(id=sub_id).first() if sub_id else None
        with transaction.atomic():
            for r in recs:
                if sub_obj:
                    Attendance.objects.update_or_create(student_id=r["student"], date=dt, subject=sub_obj, defaults={"classroom": cls_obj, "status": r["status"], "marked_by": u})
                else:
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
        
        # Per student metrics with subject breakdown
        students = User.objects.filter(role="student").select_related("classroom")
        per_student = []
        for s in students:
            s_att = Attendance.objects.filter(student=s)
            s_tot = s_att.count()
            s_pres = s_att.filter(status="present").count()
            s_ab = s_att.filter(status="absent").count()
            s_late = s_att.filter(status="late").count()
            s_exc = s_att.filter(status="excused").count()
            s_rate = round((s_pres + s_late + s_exc) / s_tot * 100, 1) if s_tot else 0.0
            
            # Subject breakdown for this student
            subj_breakdown = []
            for sub in Subject.objects.all():
                sub_att = s_att.filter(subject=sub)
                sub_tot = sub_att.count()
                if sub_tot > 0:
                    sub_p = sub_att.filter(status="present").count()
                    sub_l = sub_att.filter(status="late").count()
                    sub_e = sub_att.filter(status="excused").count()
                    sub_a = sub_att.filter(status="absent").count()
                    sub_rate = round((sub_p + sub_l + sub_e) / sub_tot * 100, 1)
                    subj_breakdown.append({"subject": sub.name, "code": sub.code, "total": sub_tot, "present": sub_p, "absent": sub_a, "late": sub_l, "excused": sub_e, "rate": sub_rate})
            
            per_student.append({
                "id": s.id, "name": s.get_full_name() or s.username, "classroom": s.classroom.name if s.classroom else "-",
                "present": s_pres, "absent": s_ab, "late": s_late, "excused": s_exc, "total": s_tot, "rate": s_rate,
                "subjects": subj_breakdown
            })
            
        # Subject overall metrics for chart
        subject_stats = []
        for sub in Subject.objects.all():
            sub_att = Attendance.objects.filter(subject=sub)
            sub_tot = sub_att.count()
            if sub_tot > 0:
                sub_good = sub_att.filter(Q(status="present") | Q(status="late") | Q(status="excused")).count()
                subject_stats.append({"name": sub.name, "rate": round(sub_good / sub_tot * 100, 1), "records": sub_tot})
            else:
                subject_stats.append({"name": sub.name, "rate": 0.0, "records": 0})

        classes = Classroom.objects.annotate(tot=Count("attendance"), pres=Count("attendance", filter=Q(attendance__status="present")), late=Count("attendance", filter=Q(attendance__status="late")), exc=Count("attendance", filter=Q(attendance__status="excused")))
        per_class = [{"name": c.name, "rate": round((c.pres + c.late + c.exc) / c.tot * 100, 1) if c.tot else 0.0} for c in classes]
        start_date = date.today() - timedelta(days=29)
        trend_qs = Attendance.objects.filter(date__gte=start_date).values("date").annotate(tot=Count("id"), pres=Count("id", filter=Q(status="present")), late=Count("id", filter=Q(status="late")), exc=Count("id", filter=Q(status="excused"))).order_by("date")
        trend = [{"date": t["date"].strftime("%Y-%m-%d"), "rate": round((t["pres"] + t["late"] + t["exc"]) / t["tot"] * 100, 1) if t["tot"] else 0.0} for t in trend_qs]
        return Response({"totals": totals, "per_student": per_student, "per_class": per_class, "subject_stats": subject_stats, "trend": trend})

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("classes", ClassroomViewSet, basename="class")
router.register("subjects", SubjectViewSet, basename="subject")
router.register("attendance", AttendanceViewSet, basename="attendance")
router.register("leaves", LeaveRequestViewSet, basename="leave")
