FROM node:current-alpine
MAINTAINER TWN

ARG BUILD_VERSION=${BUILD_VERSION}
ENV ENVIRONMENT=${ENVIRONMENT}

RUN	apk update && \
	apk upgrade && \
	apk --update add \
	bash \
	curl \
	git \
	zlib \
	php \
	nodejs \
	nodejs-npm

RUN npm i -g @angular/cli

RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python2 && \
    npm install --quiet node-gyp -g

WORKDIR /app
RUN git init
RUN git remote add origin https://github.com/hariduspilv/haridusportaal.git
RUN git fetch --tags
RUN echo ${BUILD_VERSION}
RUN git reset --hard ${BUILD_VERSION}

RUN ls -la

WORKDIR /app/angular-fe
RUN npm version ${BUILD_VERSION}
RUN npm ci
RUN ng build --prod

WORKDIR /app/node
RUN npm i

RUN apk del native-deps

EXPOSE 80

ENTRYPOINT node --max-http-header-size 30000 index.js