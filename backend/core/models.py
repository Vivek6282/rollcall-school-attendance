from django.db import models
from django.contrib.auth.models import AbstractUser

class Classroom(models.Model):
    name = models.CharField(max_length=100, unique=True)
    grade = models.CharField(max_length=50)
    teacher = models.ForeignKey("core.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="classes", limit_choices_to={"role": "teacher"})
    def __str__(self): return self.name

class User(AbstractUser):
    ROLE_CHOICES = [("admin", "Admin"), ("teacher", "Teacher"), ("student", "Student")]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name="students")

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name="subjects", null=True, blank=True)
    def __str__(self): return f"{self.name} ({self.code})"

class Attendance(models.Model):
    STATUS_CHOICES = [("present", "Present"), ("absent", "Absent"), ("late", "Late"), ("excused", "Excused")]
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance")
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name="attendance")
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name="attendance")
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-date"]

class LeaveRequest(models.Model):
    STATUS_CHOICES = [("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")]
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="leave_requests")
    date = models.DateField()
    reason = models.TextField()
    document = models.FileField(upload_to="leaves/%Y/%m/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created_at"]
