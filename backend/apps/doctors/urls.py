from rest_framework.routers import DefaultRouter
from .views import SpecialtyViewSet, DoctorViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctors')
router.register(r'specialties', SpecialtyViewSet, basename='specialties')

urlpatterns = router.urls