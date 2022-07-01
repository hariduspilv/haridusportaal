FROM eclipse-temurin:17.0.3_7-jre-alpine
VOLUME ["/htmApp", "/htmLogs"]
EXPOSE 8080 8081
WORKDIR /htmApp
ENV TZ="Europe/Tallinn"
ENTRYPOINT exec java $JAVA_OPTS -jar /htmApp/xRoad-$HTM_LIIDES_VERSION.jar
