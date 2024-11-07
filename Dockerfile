# Используем базовый образ Python
FROM python:3.10

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файл зависимостей и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Устанавливаем Netcat для проверки доступности базы данных
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Копируем весь проект в контейнер
COPY . .

# Установка переменных окружения
ENV DJANGO_SETTINGS_MODULE=DuoCor_test.settings
ENV PYTHONUNBUFFERED=1

