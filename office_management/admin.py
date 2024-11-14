from django.contrib import admin
from .models import Office, Room, Workplace, Booking


class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'workplace', 'start_time_moscow_display', 'end_time_moscow_display')

    def start_time_moscow_display(self, obj):
        return obj.start_time_moscow.strftime('%Y-%m-%d %H:%M:%S')

    start_time_moscow_display.short_description = 'Start Time (Moscow)'

    def end_time_moscow_display(self, obj):
        return obj.end_time_moscow.strftime('%Y-%m-%d %H:%M:%S')

    end_time_moscow_display.short_description = 'End Time (Moscow)'


admin.site.register(Office)
admin.site.register(Room)
admin.site.register(Workplace)
admin.site.register(Booking, BookingAdmin)

# Чтобы использовать новые verbose_name в админке, убедитесь, что ваши модели зарегистрированы
# следующим образом:
# @admin.register(Office)
# class OfficeAdmin(admin.ModelAdmin):
#     list_display = ('name', 'address')
#     search_fields = ('name', 'address')
