# FRONT-END docker instructions for different environments
## Production build from release version (https://github.com/hariduspilv/haridusportaal/releases)
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

  1. docker build . -t harbor.twn.zone/haridusportaal/angular:develop -f docker/develop/Dockerfile
  2. docker push harbor.twn.zone/haridusportaal/angular:develop

#### Connect to server and compose new containers:
  1. ssh root@haridusportaal.twn.zone
  2. docker-compose down
  3. docker-compose pull
  4. docker-compose up -d

  
