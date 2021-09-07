# Liides + Plumbr conf and prelive/live run commands:

1. Githubist tuleb võtta xRoad-0.0.1-SNAPSHOT.jar fail ja panna see /srv/data/javaApp kausta. Fail asub haridusportaali repos, services kaustas: https://github.com/hariduspilv/haridusportaal/tree/master/services
2. Kui juba eksisteerib konteiner vastava nimega, siis see eemaldada: docker rm -f htm-liides
3. docker-compose pull htm-liides
4. docker run -d --name htm-liides -p 30080:8080 -p 30081:8081 -v /srv/data/javaApp:/htmApp -v /srv/data/javaApp/logs:/logs --network htm --restart=always hub.wiseman.ee/htm/liides