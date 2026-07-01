# --- Etapa 1: Compilación ---
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build -- --configuration=production

# --- Etapa 2: Servidor Web ---
FROM nginx:alpine

# Copiamos los archivos compilados de Angular al directorio de Nginx
# NOTA: Cambia "mi-app-angular" por el nombre exacto de tu proyecto en angular.json
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copiamos una configuración básica de Nginx para soportar las rutas de Angular
# (Evita el error 404 al recargar páginas internas)
#RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
