from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from .ai_views import ai_assistant_chat

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.patients.urls')),
    path('api/', include('apps.doctors.urls')),
    path('api/', include('apps.appointments.urls')),
    path('api/ai-chat/', ai_assistant_chat),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
