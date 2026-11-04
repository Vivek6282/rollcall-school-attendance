from django.contrib import admin
from django.urls import path, include
from core.views import CustomTokenObtainPairView, MeView, AnalyticsView, router

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/auth/login/", CustomTokenObtainPairView.as_view()),
    path("api/me/", MeView.as_view()),
    path("api/analytics/", AnalyticsView.as_view()),
    path("api/", include(router.urls)),
]
