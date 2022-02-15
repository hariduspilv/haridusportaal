#   Builds angular application with storybook and node express server
#   Uses /node and /angular-fe directories
#   Node server as entrypoint, which conditionally serves one of the following:
#     stats page
#     amp
#     storybook
#     angular

FROM node:14-alpine

COPY ./angular-fe /app/angular-fe
WORKDIR /app/angular-fe
RUN npm ci
RUN npm run build-dev
RUN npm run build-storybook

RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python2 && \
    npm install --quiet node-gyp -g
COPY ./node /app/node
WORKDIR /app/node
RUN npm ci
RUN apk del native-deps

ENTRYPOINT node --max-http-header-size 80000 index.js



