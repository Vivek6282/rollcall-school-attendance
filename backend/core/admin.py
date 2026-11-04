from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Classroom, Subject, Attendance, LeaveRequest

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + ((None, {"fields": ("role", "classroom")}),)
    list_display = ("username", "email", "role", "classroom", "is_staff")

for m in [Classroom, Subject, Attendance, LeaveRequest]: admin.site.register(m)
