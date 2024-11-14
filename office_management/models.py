from django.db import models
from django.contrib.auth.models import User
import pytz


# Create your models here.

# Чтобы в админке было легче разобраться можно добавить verbose_name
# class Office(models.Model):
#     name = models.CharField(max_length=100, verbose_name="Название офиса")
#     address = models.CharField(max_length=255, verbose_name="Адрес")
#
#     class Meta:
#         verbose_name = "Офис"
#         verbose_name_plural = "Офисы"
#
#     def __str__(self):
#         return self.name
class Office(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    total_rooms = models.IntegerField()

    def __str__(self):
        return self.name


class Room(models.Model):
    office = models.ForeignKey(Office, related_name='rooms', on_delete=models.CASCADE)
    number = models.CharField(max_length=50)
    capacity = models.IntegerField()

    def __str__(self):
        return f"Room {self.number} in {self.office.name}"


class Workplace(models.Model):
    room = models.ForeignKey(Room, related_name='workplaces', on_delete=models.CASCADE)
    number = models.CharField(max_length=50)
    is_occupied = models.BooleanField(default=False)  # Флаг, чтобы указать, занято ли место

    def __str__(self):
        return f"Workplace {self.number} in {self.room}"


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    workplace = models.ForeignKey('Workplace', on_delete=models.CASCADE, related_name='bookings')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f"Booking by {self.user.username} for {self.workplace} from {self.start_time} to {self.end_time}"

    # Проверка на конфликт бронирования
    def has_conflict(self, new_start, new_end):
        conflict_exists = not (self.end_time <= new_start or self.start_time >= new_end)
        # Логирование для отладки конфликта
        if conflict_exists:
            print(
                f"Conflict detected with existing booking: {self} (new start: {new_start}, new end: {new_end})")
        else:
            print(
                f"No conflict with existing booking: {self} (new start: {new_start}, new end: {new_end})")
        return conflict_exists

    @property
    def start_time_moscow(self):
        moscow_timezone = pytz.timezone('Europe/Moscow')
        return self.start_time.astimezone(moscow_timezone)

    @property
    def end_time_moscow(self):
        moscow_timezone = pytz.timezone('Europe/Moscow')
        return self.end_time.astimezone(moscow_timezone)
