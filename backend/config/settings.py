import os, datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "change-me")
DEBUG = os.getenv("DEBUG", "0") == "1"
ALLOWED_HOSTS = ["*"]
INSTALLED_APPS = ["django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes", "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles", "rest_framework", "core"]
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware", "django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware", "django.middleware.csrf.CsrfViewMiddleware", "django.contrib.auth.middleware.AuthenticationMiddleware", "django.contrib.messages.middleware.MessageMiddleware"]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [], "APP_DIRS": True, "OPTIONS": {"context_processors": ["django.template.context_processors.request", "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages"]}}]
AUTH_USER_MODEL = "core.User"
DATABASES = {"default": {"ENGINE": "django.db.backends.postgresql", "NAME": os.getenv("POSTGRES_DB", "rollcall"), "USER": os.getenv("POSTGRES_USER", "rollcall"), "PASSWORD": os.getenv("POSTGRES_PASSWORD", "rollcall"), "HOST": os.getenv("POSTGRES_HOST", "db"), "PORT": os.getenv("POSTGRES_PORT", "5432")}}
REST_FRAMEWORK = {"DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_simplejwt.authentication.JWTAuthentication",), "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",)}
SIMPLE_JWT = {"ACCESS_TOKEN_LIFETIME": datetime.timedelta(days=1)}
TIME_ZONE, USE_TZ = "UTC", True
STATIC_URL, MEDIA_URL, MEDIA_ROOT = "static/", "/media/", BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
