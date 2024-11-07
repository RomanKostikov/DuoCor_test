from django.core.management.base import BaseCommand
from office_management.models import Office, Room, Workplace
import random


class Command(BaseCommand):
    help = 'Populate the Office, Room, and Workplace tables with random data'

    def handle(self, *args, **kwargs):
        # Очистка таблиц (по желанию)
        Workplace.objects.all().delete()
        Room.objects.all().delete()
        Office.objects.all().delete()

        # Создание офисов
        office_data = [
            {"name": "Headquarters", "address": "123 Main St", "total_rooms": 3},
            {"name": "Remote Office", "address": "456 Market St", "total_rooms": 2},
            {"name": "Branch A", "address": "789 Broadway", "total_rooms": 2},
        ]

        for office_info in office_data:
            office = Office.objects.create(
                name=office_info["name"],
                address=office_info["address"],
                total_rooms=office_info["total_rooms"]
            )

            # Создание комнат для каждого офиса
            for i in range(office_info["total_rooms"]):
                room = Room.objects.create(
                    office=office,
                    number=f"{100 + i}",
                    capacity=random.randint(5, 15)
                )

                # Создание рабочих мест в каждой комнате
                for j in range(room.capacity):
                    Workplace.objects.create(
                        room=room,
                        number=str(j + 1),
                        is_occupied=random.choice([True, False])
                    )

        self.stdout.write(
            self.style.SUCCESS("Данные успешно добавлены в таблицы Office, Room, и Workplace!"))
