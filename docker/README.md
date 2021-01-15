# FRONT-END docker instructions for different environments

## Develop (building from current working branch)
  - SERVER:
    root@haridusportaal.twn.zone

  - DEPLOY:
    1. While in repository and working directory set to /haridusportaal, build new image:
      1. docker build . -t harbor.twn.zone/haridusportaal/angular:prod -f docker/develop/Dockerfile
      2. docker push harbor.twn.zone/haridusportaal/angular:prod
    2. Connect to server, remove old container, pull and run new image on server:
      1. ssh root@haridusportaal.twn.zone
      2. docker rm -f angular
      3. docker pull harbor.twn.zone/haridusportaal/angular:prod
      3. docker run -d --name angular --restart=always --network=htm harbor.twn.zone/haridusportaal/angular:prod

  
