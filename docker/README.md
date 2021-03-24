# Server directory structure and configuration files

## Root directory holds docker-compose and related files
  1. container specific environment variables are defined in *environment-variables* directory
  2. *data* directory references container mounts and other related files
  3. *docker-compose.yaml* defines all docker containers and their configurations

## Containers

### Db
  * postgres database container
  * requires an existing database (referenced in settings.php in drupal) mount on startup
  * takes 3 env variables (e.g db.env)

### Redis
  * redis cache container for x-road and ehis requests
  * referenced by htm-liides and drupal containers

### Htm-stunnel
  * works as a connection tunnel for htm-liides container making x-road requests
  * requires certificate files and stunnel.conf for setup (examples provided)

### Htm-liides
  * defines x-road requests and provides configuration for x-road and EHIS requests
  * requires a mounted xRoad-0.0.1-SNAPSHOT.jar from github and configuration files under conf to run
  * takes 1 conditional env variable for plumbr implementation (e.g liides.env)
  * mounts logs to host

### Drupal
  * headless drupal implementation
  * main settings found in settings.php
  * takes 2 env variables to run as production implementation (e.g drupal.env)
  * adds Drupal-live plumbr if ENV=Live, config found in plumbr directory
  * source image built from Dockerfile /drupal/docker/prod directory

### Varnish
  * caching mechanism for drupal, drupal served in nginx configuration through varnish
  * requires a mounted configuration file to run (references drupal container)
  * takes 1 env variable (e.g varnish.env)

### Elasticsearch
  * provides an elasticsearch search engine
  * requires 2mb ram space allocation on startup (error-prone)
  * takes 2 env variables (e.g elasticsearch.env)
  * after running the container, when its health status is at least *yellow*, visit https://${drupal-url}/admin/config/search/elasticsearch/reindex to reindex it - select everything and click rebuild, afterwards when all numbers match clear drupal cache.
  * mounts elasticsearch nodes to host

### Angular
  * angular application with conditional storybook implementation (based on dockerfile chosen in angular-fe dir)
  * includes node application that serves angular or custom amp pages based on request
  * source image built from Dockerfile in /angular-fe directory

### Swag
  * used as an nginx server and for automated SSL cert renewal (nginx, certbot, letsencrypt)
  * configuration provided in env file (e.g swag.env)
  * requires setup before initial run: in your dns/domain provider settings, create an A record for the main domain and point it to your server IP. Also create CNAMES for subdomains and point them to the A record for the domain.
  * certificates will be generated on initial run and automatic renewal cron will be setup to run each day (updates if less than a month until expiration)
  * initial nginx setup will be generated in /root/data/swag/nginx directory, nginx.conf and site-confs/default need configuration (examples provided)

# Docker instructions for different environments
## Dev server and CI
  * root@haridusportaal.twn.zone
  * https://bamboo.twn.ee/browse/HP-DEVFE

## MANUAL DEPLOY:

### FE: Working directory set to /haridusportaal, build new image:
  1. docker build . -t harbor.twn.zone/haridusportaal/angular:develop -f angular-fe/Dockerfile
  2. docker push harbor.twn.zone/haridusportaal/angular:develop

### Connect to server and compose new containers:
  1. ssh root@haridusportaal.twn.zone
  2. docker pull harbor.twn.zone/haridusportaal/angular:develop
  3. docker pull hub.wiseman.ee/htm/drupal-dev
  4. docker image prune -f
  5. docker-compose down
  6. docker-compose up -d

## Docker compose
  * Replica of the one on the server.
  * Access over ssh: ssh root@haridusportaal.twn.zone

  
