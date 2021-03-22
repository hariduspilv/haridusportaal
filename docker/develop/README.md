# SERVER-SIDE directory structure and configuration files
## ROOT directory holds docker-compose and related files
  1. container specific environment variables are defined in *environment-variables* directory
  2. *data* directory references container mounts and other related files
  3. *docker-compose.yaml* defines all docker containers and their configurations
    * *elasticsearch* container requires 2mb ram space allocation on startup (error-prone)
    * *varnish* container used as a caching wrapper for drupal (drupal container served by nginx through varnish)
    * *redis* container used for caching xroad data (referenced by drupal and htm-liides containers)
    * *stunnel* container used to proxy (allow) x-road requests
    * *stunnelsec* container only used in develop to allow x-road requests from multiple sources
    * *htm-liides* defines x-road requests and provides configuration for x-road and EHIS connections
    * *nginx* container serves the application
    * *swag* container used for SSL certs and cert-renewal
    * Other containers are self-explanatory

# Docker instructions for different environments
## FRONT-END Production build from release version (https://github.com/hariduspilv/haridusportaal/releases)
  1. Working directory set to /angular-fe (replace build version with release tag (e.g 1.54.8))
    1. docker build . --build-arg BUILD_VERSION=1.54.8 -t hub.wiseman.ee/htm/angular:prod
    2. docker push hub.wiseman.ee/htm/angular:prod
## Develop (building from current working branch)
### SERVER:
  * root@haridusportaal.twn.zone

### CI:
  https://bamboo.twn.ee/browse/HP-DEVFE

### MANUAL DEPLOY:

#### Working directory set to /haridusportaal, build new image:
  * Possible repositories, docker-compose.yaml specifies currently used one
    * harbor.twn.zone/haridusportaal/angular:develop
    * hub.wiseman.ee/htm/angular-dev:develop

  1. docker build . -t harbor.twn.zone/haridusportaal/angular:develop -f docker/develop/Dockerfile.angular
  2. docker push harbor.twn.zone/haridusportaal/angular:develop

#### Connect to server and compose new containers:
  1. ssh root@haridusportaal.twn.zone
  2. docker pull harbor.twn.zone/haridusportaal/angular:develop
  3. docker pull hub.wiseman.ee/htm/drupal-dev
  4. docker image prune -f
  5. docker-compose down
  6. docker-compose up -d

## Docker compose
  * Replica of the one on the server.
  * Access over ssh: ssh root@haridusportaal.twn.zone

## Environment files in environment-varibles directory
  * These files hold env variables for their respective containers
  * Store in the same directory as docker-compose.yaml
  
