from rest_framework.routers import DefaultRouter
from .views import SpecialtyViewSet, DoctorViewSet, DoctorScheduleViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctors')
router.register(r'specialties', SpecialtyViewSet, basename='specialties')
router.register(r'schedules', DoctorScheduleViewSet, basename='schedules')

urlpatterns = router.urls
