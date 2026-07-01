# --- Etapa 1: Compilación ---
# imagen de Maven con Java 21 para compilar el proyecto
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar el archivo de configuración de dependencias
COPY autostore-sys-web/pom.xml .
# Copiar el código fuente
COPY autostore-sys-web/src ./src

# Compiar el proyecto omitiendo los tests para acelerar el proceso
RUN mvn clean package -DskipTests

# --- Etapa 2: Ejecución ---
# Usamos una imagen de Java en ejecución mucho más ligera (JRE)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiamos el archivo .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Exponemos el puerto por defecto de Spring Boot
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]