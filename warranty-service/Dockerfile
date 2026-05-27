FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ARG JAR_FILE=warranty-service/build/libs/*.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
