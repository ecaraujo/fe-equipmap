FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY maintenance-service/build/libs/maintenance-service-*-SNAPSHOT.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
