FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY equipment-service/build/libs/equipment-service-*-SNAPSHOT.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
