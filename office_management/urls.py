from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OfficeViewSet, BookingViewSet, RoomViewSet

router = DefaultRouter()
router.register(r'offices', OfficeViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'rooms', RoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
