from rest_framework import serializers
from .models import Office, Room, Workplace, Booking
from django.contrib.auth.models import User
import pytz
from django.utils import timezone


class WorkplaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workplace
        fields = ['id', 'number', 'is_occupied']


class RoomSerializer(serializers.ModelSerializer):
    workplaces = WorkplaceSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'number', 'capacity', 'workplaces']


class OfficeSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model = Office
        fields = ['id', 'name', 'address', 'total_rooms', 'rooms']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']


class BookingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    workplace = serializers.PrimaryKeyRelatedField(queryset=Workplace.objects.all())

    class Meta:
        model = Booking
        fields = ['id', 'user', 'workplace', 'start_time', 'end_time']

    def validate(self, data):
        print("Validating data in BookingSerializer:", data)
        moscow_timezone = pytz.timezone('Europe/Moscow')

        # Приведение времени к московскому часовому поясу и затем к UTC
        if data['start_time'].tzinfo is None:
            data['start_time'] = moscow_timezone.localize(data['start_time']).astimezone(pytz.UTC)
        if data['end_time'].tzinfo is None:
            data['end_time'] = moscow_timezone.localize(data['end_time']).astimezone(pytz.UTC)

        # Получение текущего времени в московском часовом поясе
        current_time_in_moscow = timezone.now().astimezone(moscow_timezone)
        # Проверка, что время начала меньше времени окончания
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Время начала должно быть раньше времени окончания.")

        # Проверка, что время начала не находится в прошлом (сравнение с московским временем)
        if data['start_time'] < current_time_in_moscow:
            raise serializers.ValidationError(
                "Нельзя забронировать рабочее место на прошедшее время.")

        # Проверка на конфликты бронирования
        existing_bookings = Booking.objects.filter(workplace=data['workplace'])
        for booking in existing_bookings:
            if booking.has_conflict(data['start_time'], data['end_time']):
                raise serializers.ValidationError(
                    "This workplace is already booked for the specified time range.")

        return data
