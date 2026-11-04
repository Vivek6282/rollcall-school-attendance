# 🍎 RollCall - Dockerized School Attendance & Leave Management Web Application

RollCall is a production-ready, full-stack, containerized school attendance and leave management web platform. It provides role-tailored workflows for **Administrators**, **Teachers**, and **Students**, paired with automated attendance metrics, leave approvals with document uploads, and school-wide analytics.

---

## 🌟 Key Features

### 👤 Role-Based Portals

- **Admin Dashboard**:
  - Full CRUD operations for Users (Admins, Teachers, Students) and Classrooms.
  - Interactive school-wide attendance KPIs (Total Students, Teachers, Classes, Overall Attendance Rate).
  - 30-day attendance trend line chart and per-class rate comparison bar chart using Recharts.
  - Searchable and sortable student roster with automatic `< 75%` attendance **"At Risk"** alerts.
- **Teacher Portal**:
  - Daily attendance roster by class with one-click toggles (`Present`, `Absent`, `Late`, `Excused`).
  - "Mark All Present" convenience action with atomic bulk updates.
  - Review student leave requests with access to attached excuse documents, with direct Approve/Reject capabilities.
  - Approving a leave automatically updates the student's attendance record to `Excused` for that date.
- **Student Portal**:
  - Visual attendance rate display and breakdown counts.
  - Complete personal attendance history.
  - Leave application submission with reason, target date, and supporting document upload (PDF/images).
  - Real-time leave approval status tracker with links to uploaded files.

---

## 🏗️ Architecture & Tech Stack

RollCall is orchestrated as a 3-tier micro-service containerized architecture:

| Tier | Component | Technology | Description |
| :--- | :--- | :--- | :--- |
| **Reverse Proxy & Web Server** | `web` | **Nginx (Alpine)** | Serves compiled React static assets, terminates client traffic, proxies `/api/` calls to Django, and directly serves `/media/` file uploads from a shared volume. |
| **Frontend Client** | `web` (build stage) | **React 18 + Vite 5 + Tailwind CSS (Play CDN) + Recharts** | Single Page Application (SPA) with JWT auth interceptors, warm notebook aesthetics, responsive layouts, and interactive dashboards. |
| **API & Business Logic** | `backend` | **Python 3.12 + Django 5.0 + Django REST Framework + SimpleJWT + Gunicorn** | RESTful API with custom User models, atomic transactions, ORM-aggregated metrics, and role-scoped permissions. |
| **Relational Database** | `db` | **PostgreSQL 16 (Alpine)** | Persistent relational database storing users, classes, attendance records, and leave requests. |

---

## 🐳 Containerization & Storage Design

The entire stack is configured via `docker-compose.yml` to build and run with a single command on any machine with Docker installed:

```
[ Browser / Client ]
         |
         | HTTP (Port 8080)
         v
+-------------------------------------------------------------+
| Nginx (web container)                                       |
|  - Serves React SPA (dist) on /                             |
|  - Serves static media files on /media/                     |
|  - Reverse-proxies API requests on /api/ to backend:8000    |
+-------------------------------------------------------------+
         |                              |
         | Internal HTTP:8000           | Direct Volume Access
         v                              v
+-------------------------------+  +--------------------------+
| Gunicorn / Django (backend)   |  | Shared Volume: media     |
|  - REST API & Business Logic  |--| (Leave upload docs)      |
+-------------------------------+  +--------------------------+
         |
         | Internal TCP:5432
         v
+-------------------------------+  +--------------------------+
| PostgreSQL 16 (db)            |--| Persistent Volume: pgdata|
|  - Healthcheck-gated startup  |  +--------------------------+
+-------------------------------+
```

### Key Containerization Details:
1. **Multi-Stage Frontend Build**: `frontend/Dockerfile` uses `node:20-alpine` to install dependencies and run `npm run build`, then copies only the production `/dist` artifact into `nginx:alpine`, keeping the web image lightweight and secure.
2. **Healthcheck Startup Gating**: The `db` container runs a native `pg_isready` healthcheck (`interval: 3s, timeout: 5s, retries: 20`). The `backend` container waits for the database to be fully healthy (`condition: service_healthy`) before executing migrations, seeding, or starting Gunicorn.
3. **Automated Initialization**: Upon starting, the backend container automatically executes:
   - `python manage.py makemigrations core`
   - `python manage.py migrate`
   - `python manage.py seed` (Idempotently seeds sample teachers, classrooms, students, and 20 weekdays of weighted attendance)
4. **Volume Management**:
   - `pgdata`: Named persistent volume preserving PostgreSQL state across container restarts.
   - `media`: Shared volume mounted read-write to backend (`/app/media`) for uploads and read-only to Nginx (`/media:ro`) for direct static file delivery.

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running on Windows, macOS, or Linux)
- [Git](https://git-scm.com/)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vivek6282/rollcall-school-attendance.git
   cd rollcall-school-attendance
   ```

2. **Set up the environment file:**
   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.example .env

   # On Linux / macOS:
   cp .env.example .env
   ```

3. **Start the containers:**
   ```bash
   docker compose up --build
   ```

4. **Access the application:**
   Open your browser and navigate to:
   👉 **`http://localhost:8080`**

---

## 🔑 Demo Login Credentials

The seed script creates realistic demo users ready for testing immediately. You can also click the **Quick Demo Fill** buttons on the login page:

| Role | Username | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full administrative control & analytics |
| **Teacher** | `t.sharma` | `teach123` | Class Teacher for *"Grade 8 - Sunflower"* |
| **Teacher** | `t.okafor` | `teach123` | Class Teacher for *"Grade 9 - Oak"* |
| **Student** | `s1` | `stud123` | Aarav Patel (Grade 8) - includes sample leave request |
| **Student** | `s2` to `s10` | `stud123` | Enrolled students across classes |

---

## 🛠️ Project Structure

```
.
├── docker-compose.yml              # Multi-container orchestration & volumes
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore file
├── README.md                       # Documentation & deployment guide
├── backend/
│   ├── Dockerfile                  # Python 3.12-slim backend container
│   ├── requirements.txt            # Django, DRF, SimpleJWT, psycopg, gunicorn
│   ├── manage.py
│   ├── config/                     # Django project settings & URLs
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── core/                       # Core application domain
│       ├── models.py               # User, Classroom, Attendance, LeaveRequest
│       ├── serializers.py          # DRF Serializers & Custom JWT tokens
│       ├── views.py                # ViewSets, bulk attendance & analytics
│       ├── admin.py
│       └── management/commands/
│           └── seed.py             # Idempotent database seeder
└── frontend/
    ├── Dockerfile                  # Multi-stage Node.js build -> Nginx
    ├── nginx.conf                  # Nginx proxy configuration
    ├── package.json                # React, Vite, Axios, Recharts
    ├── vite.config.js
    ├── index.html                  # Play CDN Tailwind & Google Nunito font
    └── src/
        ├── main.jsx
        ├── api.js                  # Axios client with JWT interceptor
        ├── App.jsx                 # Auth Context, Router & Login view
        ├── Admin.jsx               # Analytics & CRUD portal
        ├── Teacher.jsx             # Attendance marking & Leave review
        └── Student.jsx             # Attendance history & Leave upload
```

---

## 🛑 Stopping & Maintenance

- **Stop containers:**
  Press `Ctrl + C` in the running terminal, or run:
  ```bash
  docker compose down
  ```

- **Reset database and media volumes:**
  ```bash
  docker compose down -v
  ```

- **View backend logs:**
  ```bash
  docker compose logs -f backend
  ```

