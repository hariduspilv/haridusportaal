# Liides + Plumbr conf and prelive/live run commands:

1. Githubist tuleb võtta xRoad-0.0.1-SNAPSHOT.jar fail ja panna see /srv/data/javaApp kausta. Fail asub haridusportaali repos, services kaustas: https://github.com/hariduspilv/haridusportaal/tree/master/services
2. Kui juba eksisteerib konteiner vastava nimega, siis see eemaldada: docker rm -f htm-liides
3. docker-compose pull htm-liides
4. docker run -d --name htm-liides -p 30080:8080 -p 30081:8081 -v /srv/data/javaApp:/htmApp -v /srv/data/javaApp/logs:/logs --network htm --restart=always hub.wiseman.ee/htm/liides

# local DEV
## ssh
dev serveris asub conf, logis ja jar /root/data/javaApp

pordi suunamised

    turvaserver-test:   30088
    turvaserver-dev:    30089
    rest:               30080 
    remote debugger:    30082
    actuator:           30081

## Redis
application.properties failis redise conf. suunada nt dockeri redis containeri vastu

    spring.redis.host=redis
    spring.redis.port=6379

## xRaod
xroad.properties failis 

    security-server=http://localhost:30088/cgi-bin/consumer_proxy

XRoad Service properties, each service can have own client properties, security-server ect.
    
    {service}-security-server=
    {service}-id-code=
    {service}-client-object-type=
    {service}-client-xroad-instance=
    {service}-client-member-class=
    {service}-client-member-code=
    {service}-client-subsystem-code=
    {service}-protocol-version=

# Tarne
tarne puhul on xroad/pom.xml versioon vahetatud tarne numbri vastu ja siis 'mvn clean install' mis loob uue 'xRoad-{tarne number}.jar' mis on commititud git