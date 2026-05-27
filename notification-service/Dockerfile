FROM eclipse-temurin:21-jre
WORKDIR /app
COPY notification-service/build/libs/notification-service-*.jar app.jar
EXPOSE 8088
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
