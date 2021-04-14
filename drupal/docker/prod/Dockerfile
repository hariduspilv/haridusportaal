FROM alpine:3.7
MAINTAINER TWN

ENV BUILD_VERSION=${BUILD_VERSION}
ENV ENVIRONMENT=${ENVIRONMENT}

RUN	BUILD_DEPS=" \
    	gnupg \
    	tar \
    	build-base \
    	autoconf \
    	automake \
    	pcre-dev \
    	libtool \
    	libffi-dev \
    	openssl-dev \
    	python-dev \
	zlib \
    	samba-dev"
RUN	apk update && \
	apk upgrade && \
	apk --update add \
	${BUILD_DEPS} \
	bash \
	curl \
	git \
	zlib \
	apache2 \
	postgresql-client \
	php7 \
	php7-apache2 \
        php7-bcmath \
        php7-dom \
        php7-ctype \
        php7-curl \
        php7-fileinfo \
        php7-fpm \
        php7-gd \
        php7-iconv \
        php7-intl \
        php7-json \
        php7-mbstring \
        php7-mcrypt \
        php7-mysqlnd \
        php7-opcache \
        php7-openssl \
        php7-pdo \
        php7-pdo_pgsql \
        php7-phar \
        php7-posix \
        php7-simplexml \
        php7-session \
        php7-soap \
        php7-tokenizer \
        php7-xml \
        php7-xmlreader \
        php7-xmlwriter \
	php7-zip \
	php7-zlib \
	librdkafka \
	php7-pear \
	php7-dev \
	php7-soap \
	php7-sockets \
	php7-memcached \
	libcrypto1.0 \
	libssl1.0

# redis
RUN	apk update && \
	apk add make g++ python autoconf php7-dev && \
	pecl channel-update pecl.php.net && \
    printf "\n" | curl 'http://pecl.php.net/get/redis-4.1.1.tgz' -o redis-4.1.1.tgz && \
    pecl install redis-4.1.1.tgz && \
    rm -rf redis-4.1.1.tgz && \
    rm -rf /tmp/pear && \
	echo "extension=redis.so" > /etc/php7/conf.d/redis.ini

# librdkafka
RUN	cd /tmp && \
	git clone --depth 1 --branch v0.11.1 https://github.com/edenhill/librdkafka.git && \
	cd /tmp/librdkafka && \
	./configure && \
	make && \
	make install && \
	rm -rf /tmp/librdkafka

# php-rdkafka
RUN	cd /tmp && git clone --depth 1 --branch 3.0.5 https://github.com/arnaud-lb/php-rdkafka.git && \
	cd /tmp/php-rdkafka && \
	phpize && \
	./configure && \
	make all -j 5 && \
	make install && \
	echo "extension=rdkafka.so" > /etc/php7/conf.d/rdkafka.ini && \
	rm -rf /tmp/php-rdkafka && \
	rm -rf /var/cache/apk/*

RUN	curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
	composer global require drush/drush && \
	composer global update && \
	ln -s /root/.composer/vendor/bin/drush /usr/local/bin/drush && \
	mkdir -p /app/drupal  && \
	chown -R apache:apache /app/drupal && \
	mkdir /run/apache2 && \
	sed -i 's#^DocumentRoot ".*#DocumentRoot "/app/drupal/web"#g' /etc/apache2/httpd.conf && \
	sed -i 's#/var/www/localhost/htdocs#/app/drupal/web#' /etc/apache2/httpd.conf && \
	sed -i 's#AllowOverride None#AllowOverride All#' /etc/apache2/httpd.conf && \
	apk del ${BUILD_DEPS} php7-pear php7-dev && \
	echo "Success"

ADD httpd.conf /httpd.conf
RUN mv httpd.conf /etc/apache2/httpd.conf

ADD plumbr-agent-installer /plumbr-agent-installer

ADD run.sh /run.sh
RUN chmod +x /run.sh

ADD php.ini /php.ini
RUN mv php.ini /etc/php7/php.ini

ADD auth.conf /auth.conf
RUN mv auth.conf /etc/apache2/conf.d/auth.conf

ADD crontab.txt /crontab.txt
RUN /usr/bin/crontab /crontab.txt

EXPOSE 8080

WORKDIR /app/drupal

ENTRYPOINT ["/run.sh"]
