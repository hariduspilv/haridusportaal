# Server directory structure and configuration files

## Root directory holds docker-compose and related files
  1. container specific environment variables are defined in containers.env
  2. *data* directory references container mounts and other related files
  3. *docker-compose.yaml* defines all docker containers and their configurations

## Containers

### Db
  * postgres database container
  * requires an existing database (referenced in settings.php in drupal) mount on startup
  * takes 3 env variables (containers.env)

### Redis
  * redis cache container for x-road and ehis requests
  * referenced by htm-liides and drupal containers

### Htm-stunnel
  * works as a connection tunnel for htm-liides container making x-road requests
  * requires certificate files and stunnel.conf for setup (examples provided)
  * ports 30088 and 30089 opened to make direct connections from outside (for testing purposes)

### Htm-liides
  * defines x-road requests and provides configuration for x-road and EHIS requests
  * requires a mounted xRoad-0.0.1-SNAPSHOT.jar from github and configuration files under conf to run
  * takes 1 conditional env variable for plumbr implementation (containers.env)
  * mounts logs to host (/root/data/javaApp/logs)
  * ports 30080 and 30081 opened to make direct connections from outside (for testing purposes)

### Drupal
  * headless drupal implementation
  * main settings found in settings.php
  * takes 2 env variables to run as production implementation (containers.env)
  * adds Drupal-live plumbr if ENV=Live, config found in plumbr directory
  * source image built from Dockerfile /drupal/docker/prod directory

### Varnish
  * caching mechanism for drupal, drupal served in nginx configuration through varnish
  * requires a mounted configuration file to run (references drupal container)
  * takes 1 env variable (containers.env)

### Elasticsearch
  * provides an elasticsearch search engine
  * requires 2mb ram space allocation on startup (error-prone)
  * takes 2 env variables (containers.env)
  * needs hunspell dictionary ee_ET directory as mount (example provided)
  * container might need permissions to write into mount (ERR: AccessDeniedException[/usr/share/elasticsearch/data/nodes])
    run: chown -R 1000:1000 /root/data/elasticsearch
  * after running the container, when its health status is at least *yellow*, visit https://${drupal-url}/admin/config/search/elasticsearch/reindex to reindex it - select everything and click rebuild, afterwards when all numbers match clear drupal cache.
  * mounts elasticsearch nodes to host

### Angular / node
  * angular application with conditional storybook implementation (based on dockerfile chosen in angular-fe dir)
  * runs as a node application that serves angular or custom amp pages based on request (for SEO)
  * takes 1 env variables (containers.env)
  * source image built from Dockerfile in /angular-fe directory

### Swag
  * used as an nginx server and for automated SSL cert renewal (nginx, certbot, letsencrypt)
  * configuration provided in env file (containers.env)
  * requires setup before initial run: in your dns/domain provider settings, create an A record for the main domain and point it to your server IP. Also create CNAMES for subdomains and point them to the A record for the domain.
  * certificates will be generated on initial run and automatic renewal cron will be setup to run each day (updates if less than a month until expiration)
  * initial nginx setup will be generated in /root/data/swag/nginx directory, nginx.conf and site-confs/default need configuration (examples provided)

# Docker instructions for different environments

## FE Building for production environments in /angular-fe directory (required on every release)
  1. docker build . --build-arg BUILD_VERSION=2.9.5 -f Dockerfile.prod -t harbor.twn.zone/haridusportaal/angular:prod
    * Testing: docker run -d --name angular-live -p 4400:80 -e AMP_API=https://api.hp.edu.ee -t harbor.twn.zone/haridusportaal/angular:prod
  2. docker build . --build-arg BUILD_VERSION=2.9.4 -f Dockerfile.prelive -t harbor.twn.zone/haridusportaal/angular:prelive
    * Testing: docker run -d --name angular-prelive -p 4400:80 -e AMP_API=https://apitest.hp.edu.ee -t harbor.twn.zone/haridusportaal/angular:prelive
  3. docker push harbor.twn.zone/haridusportaal/angular:prod
  4. docker push harbor.twn.zone/haridusportaal/angular:prelive
## BE Building for production environments in /drupal/docker/prod if updating drupal or other dependecies (not required on every release)
  1. docker build . -t harbor.twn.zone/haridusportaal/drupal:prod
  2. docker push harbor.twn.zone/haridusportaal/drupal:prod
## Dev server and CI
  * root@haridusportaal.twn.zone

### CI:
  https://bamboo.twn.ee/browse/HP-DEVFE
## FE Building for production environments in /angular-fe directory (required on every release)
  1. docker build . --build-arg BUILD_VERSION=2.6.9 -f Dockerfile.prod -t harbor.twn.zone/haridusportaal/angular:prod
  2. docker build . --build-arg BUILD_VERSION=2.6.9 -f Dockerfile.prelive -t harbor.twn.zone/haridusportaal/angular:prelive
  3. docker push harbor.twn.zone/haridusportaal/angular:prod
  4. docker push harbor.twn.zone/haridusportaal/angular:prelive

## MANUAL DEPLOY:

### FE: Working directory set to /haridusportaal, build new image:
  1. docker build . -t harbor.twn.zone/haridusportaal/angular:develop -f angular-fe/Dockerfile
  2. docker push harbor.twn.zone/haridusportaal/angular:develop

### Connect to server and compose new containers:
  1. ssh root@haridusportaal.twn.zone
  2. docker-compose pull
  3. docker-compose down
  4. docker-compose up -d
  5. docker image prune -a -f


## Docker compose
  * Replica of the one on the server.
  * Access over ssh: ssh root@haridusportaal.twn.zone

  
