# Используем базовый образ node:20-alpine
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и pnpm-lock.yaml
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Устанавливаем pnpm
RUN npm install -g pnpm

# Устанавливаем зависимости с использованием pnpm
RUN npm install --frozen-lockfile

# Устанавливаем Prisma как dev-зависимость
RUN pnpm add prisma --save-dev

# Копируем остальные файлы в контейнер
COPY . .

# Генерируем Prisma client
RUN npx prisma generate

# Открываем порт 3000
EXPOSE 3000

# Запускаем приложение
CMD ["pnpm", "start"]
