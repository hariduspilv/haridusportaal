# FRONT-END docker instructions for different environments
## Production build from release version (https://github.com/hariduspilv/haridusportaal/releases)
  1. Working directory set to /angular-fe (replace build version with release tag (e.g 1.54.8))
    1. docker build . --build-arg BUILD_VERSION=1.54.8 -t hub.wiseman.ee/htm/angular:prod
    2. docker push hub.wiseman.ee/htm/angular:prod
## Develop (building from current working branch)
  - SERVER:
    root@haridusportaal.twn.zone
  - DEPLOY:
    1. Working directory set to /haridusportaal, build new image:
      1. docker build . -t harbor.twn.zone/haridusportaal/angular:develop -f docker/develop/Dockerfile
      2. docker push harbor.twn.zone/haridusportaal/angular:develop
    2. Connect to server, remove old container, pull and run new image on server:
      1. ssh root@haridusportaal.twn.zone
      2. docker rm -f angular
      3. docker pull harbor.twn.zone/haridusportaal/angular:develop
      3. docker run -d --name angular --restart=always --network=htm harbor.twn.zone/haridusportaal/angular:develop

  
