import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from core.models import User, Classroom, Attendance, LeaveRequest

class Command(BaseCommand):
    help = "Seed database with demo data"

    def handle(self, *args, **options):
        if User.objects.filter(username="admin").exists():
            self.stdout.write("Admin exists, skipping seed.")
            return
        random.seed(42)
        admin = User.objects.create_superuser("admin", "admin@school.org", "admin123", role="admin")
        t1 = User.objects.create_user("t.sharma", "t.sharma@school.org", "teach123", first_name="Tara", last_name="Sharma", role="teacher")
        t2 = User.objects.create_user("t.okafor", "t.okafor@school.org", "teach123", first_name="Tunde", last_name="Okafor", role="teacher")
        c1 = Classroom.objects.create(name="Grade 8 - Sunflower", grade="8", teacher=t1)
        c2 = Classroom.objects.create(name="Grade 9 - Oak", grade="9", teacher=t2)
        student_data = [
            ("s1", "Aarav", "Patel", c1), ("s2", "Zoe", "Kowalski", c1), ("s3", "Carlos", "Mendoza", c1),
            ("s4", "Fatima", "Al-Mansoor", c1), ("s5", "Liam", "O'Connor", c1), ("s6", "Chloe", "Dubois", c2),
            ("s7", "Kenji", "Sato", c2), ("s8", "Amara", "Eze", c2), ("s9", "Maya", "Lin", c2), ("s10", "Dante", "Moretti", c2),
        ]
        students = [User.objects.create_user(u, f"{u}@school.org", "stud123", first_name=fn, last_name=ln, role="student", classroom=cls) for u, fn, ln, cls in student_data]
        today, weekdays, curr = date.today(), [], date.today()
        while len(weekdays) < 20:
            if curr.weekday() < 5: weekdays.append(curr)
            curr -= timedelta(days=1)
        weekdays.reverse()
        statuses, weights = ["present", "absent", "late", "excused"], [85, 7, 5, 3]
        for s in students:
            for day in weekdays:
                st = random.choices(statuses, weights=weights)[0]
                Attendance.objects.create(student=s, classroom=s.classroom, date=day, status=st, marked_by=s.classroom.teacher)
        LeaveRequest.objects.create(student=students[0], date=today, reason="Dental appointment", status="pending")
        LeaveRequest.objects.create(student=students[5], date=today - timedelta(days=1), reason="Family event", status="approved")
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
