from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Office, Booking, Workplace, Room
from .serializers import OfficeSerializer, BookingSerializer, RoomSerializer, WorkplaceSerializer
from rest_framework.decorators import action
from django.utils import timezone
import pytz
from django.utils.dateparse import parse_datetime


# Create your views here.
class OfficeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Office.objects.all()
    serializer_class = OfficeSerializer


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print("=== Начало функции create ===")
        data = request.data.copy()
        print(f"Исходные данные запроса: {data}")

        # Обработка времени
        moscow_timezone = pytz.timezone('Europe/Moscow')
        start_time = parse_datetime(data.get('start_time'))
        end_time = parse_datetime(data.get('end_time'))
        if start_time:
            data['start_time'] = moscow_timezone.localize(start_time).astimezone(pytz.UTC)
        if end_time:
            data['end_time'] = moscow_timezone.localize(end_time).astimezone(pytz.UTC)
        print(f"Данные после обработки времени: {data}")

        data['user'] = request.user.id
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print("=== Ошибка валидации данных ===")
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        print("Данные прошли валидацию")

        # Проверка на конфликт
        print("Проверка на конфликт бронирования...")
        conflicting_booking = Booking.objects.filter(
            workplace_id=serializer.validated_data["workplace"].id,
            start_time__lt=serializer.validated_data["end_time"],
            end_time__gt=serializer.validated_data["start_time"]
        ).first()
        if conflicting_booking:
            print("=== Конфликт бронирования найден ===")
            return Response(
                {"detail": "This workplace is already booked for the specified time range."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Если конфликтов нет, сохраняем бронирование
        print("Бронирование сохраняется...")
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='availability/(?P<room_id>[^/.]+)')
    def availability(self, request, room_id=None):
        # Получаем текущее время
        current_time = timezone.now()

        # Находим рабочие места в указанной комнате
        workplaces = Workplace.objects.filter(room_id=room_id)

        # Формируем ответ с информацией о доступности
        response_data = []
        for workplace in workplaces:
            current_booking = workplace.bookings.filter(
                start_time__lte=current_time,
                end_time__gte=current_time
            ).first()

            status = "Occupied" if current_booking else "Free"
            end_time = current_booking.end_time if current_booking else None
            response_data.append({
                "id": workplace.id,
                "number": workplace.number,
                "status": status,
                "occupied_until": end_time,
                "current_user": current_booking.user.username if current_booking else None
            })

        return Response(response_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='upcoming_availability/(?P<workplace_id>\d+)')
    def upcoming_availability(self, request, workplace_id=None):
        # Используем текущее время в UTC
        current_time = timezone.now()  # Текущее время в UTC

        # Получаем все будущие или текущие бронирования
        all_bookings = Booking.objects.filter(
            workplace_id=workplace_id,
            end_time__gte=current_time  # Бронирования, которые еще не закончились
        ).order_by('start_time')

        # Ищем текущее бронирование
        current_booking = all_bookings.filter(
            start_time__lte=current_time,
            end_time__gte=current_time
        ).first()

        # Ищем следующее бронирование
        next_booking = all_bookings.filter(
            start_time__gt=current_time
        ).order_by('start_time').first()

        # Для отображения преобразуем время в московский часовой пояс
        moscow_timezone = pytz.timezone('Europe/Moscow')

        response_data = {
            "is_occupied": bool(current_booking),
            "current_booking": {
                "start_time": current_booking.start_time.astimezone(
                    moscow_timezone) if current_booking else None,
                "end_time": current_booking.end_time.astimezone(
                    moscow_timezone) if current_booking else None,
                "user": {
                    "username": current_booking.user.username if current_booking else None
                } if current_booking else None,
            },
            "next_booking": {
                "start_time": next_booking.start_time.astimezone(
                    moscow_timezone) if next_booking else None,
                "end_time": next_booking.end_time.astimezone(
                    moscow_timezone) if next_booking else None,
                "user": {
                    "username": next_booking.user.username if next_booking else None
                } if next_booking else None,
            },
            "bookings": [
                {
                    "id": booking.id,
                    "start_time": booking.start_time.astimezone(moscow_timezone),
                    "end_time": booking.end_time.astimezone(moscow_timezone),
                    "user": {
                        "username": booking.user.username if booking.user else None
                    }
                } for booking in all_bookings
            ]
        }

        return Response(response_data, status=status.HTTP_200_OK)


class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    @action(detail=True, methods=['get'], url_path='workplaces')
    def workplaces(self, request, pk=None):
        # Получаем рабочие места, связанные с конкретной комнатой
        workplaces = Workplace.objects.filter(room_id=pk)
        serializer = WorkplaceSerializer(workplaces, many=True)
        return Response(serializer.data)
