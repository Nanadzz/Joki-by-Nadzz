FROM node:20-alpine
# Zona waktu WIB: dipakai jadwal ketersediaan worker (jam mulai/selesai)
RUN apk add --no-cache tzdata
ENV TZ=Asia/Jakarta
WORKDIR /app
COPY backend/package.json ./backend/
RUN cd backend && npm install --omit=dev
COPY backend ./backend
COPY frontend ./frontend
# Port sebenarnya ditentukan variabel PORT (Railway mengisinya otomatis); 3000 hanya bawaan lokal
EXPOSE 3000
CMD ["node","backend/server.js"]
