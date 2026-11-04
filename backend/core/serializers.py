from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Classroom, Subject, Attendance, LeaveRequest

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        t = super().get_token(user); t["role"], t["username"] = user.role, user.username; return t
    def validate(self, attrs):
        data = super().validate(attrs); data.update({"id": self.user.id, "username": self.user.username, "role": self.user.role}); return data

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    classroom_name = serializers.CharField(source="classroom.name", read_only=True)
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "role", "classroom", "classroom_name", "password"]
    def create(self, val):
        pwd = val.pop("password", None)
        if val.get("role") == "admin": val["is_staff"] = val["is_superuser"] = True
        u = User(**val)
        if pwd: u.set_password(pwd)
        u.save(); return u
    def update(self, inst, val):
        pwd = val.pop("password", None)
        for k, v in val.items(): setattr(inst, k, v)
        if inst.role == "admin": inst.is_staff = inst.is_superuser = True
        if pwd: inst.set_password(pwd)
        inst.save(); return inst

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code", "classroom"]

class ClassroomSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    student_count = serializers.IntegerField(source="students.count", read_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)
    class Meta:
        model = Classroom
        fields = ["id", "name", "grade", "teacher", "teacher_name", "student_count", "subjects"]
    def get_teacher_name(self, o): return (o.teacher.get_full_name() or o.teacher.username) if o.teacher else ""

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    class Meta:
        model = Attendance
        fields = ["id", "student", "student_name", "classroom", "subject", "subject_name", "date", "status", "marked_by", "created_at"]
        read_only_fields = ["marked_by", "created_at"]
    def get_student_name(self, o): return o.student.get_full_name() or o.student.username

class LeaveRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    class Meta:
        model = LeaveRequest
        fields = ["id", "student", "student_name", "date", "reason", "document", "status", "created_at"]
        read_only_fields = ["created_at"]
    def get_student_name(self, o): return o.student.get_full_name() or o.student.username
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        req = self.context.get("request")
        if req and req.user.is_authenticated and req.user.role == "student":
            self.fields["student"].read_only = self.fields["status"].read_only = True
