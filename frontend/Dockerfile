# Указываем базовый образ Node.js
FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
#COPY package*.json ./

# Устанавливаем только продакшн-зависимости
#RUN npm ci --only=production

# Копируем остальной код приложения
COPY . .

# Указываем порт, который будет использовать контейнер
EXPOSE 3000

# Устанавливаем переменную среды для продакшн-окружения
ENV NODE_ENV=production

# Запускаем приложение
CMD npm install --force && npm start

