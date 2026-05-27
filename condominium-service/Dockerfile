FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY condominium-service/build/libs/condominium-service-*-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
