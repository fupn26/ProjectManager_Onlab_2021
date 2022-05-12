FROM gradle:7-jdk17-alpine AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build --no-daemon

FROM openjdk:17-alpine
EXPOSE 8080
RUN mkdir /app
RUN wget https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v1.13.1/opentelemetry-javaagent.jar
COPY --from=build /home/gradle/src/build/libs/*SNAPSHOT.jar /app/spring-boot-application.jar
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-javaagent:opentelemetry-javaagent.jar", "-jar","/app/spring-boot-application.jar"]