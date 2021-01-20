# Docker instructions

## Docker compose
  * Replica of the one on the server.
  * Access over ssh: ssh root@haridusportaal.twn.zone

## Dockerfile
  * Builds angular application with storybook and node express server
  * Uses /node and /angular-fe directories
  * Node server as entrypoint, which conditionally serves one of the following:
    * stats page
    * amp
    * storybook
    * angular
