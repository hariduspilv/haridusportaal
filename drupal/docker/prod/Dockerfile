FROM drupal:9-php8.1-apache-buster
MAINTAINER TWN

ENV BUILD_VERSION=${BUILD_VERSION}
ENV ENVIRONMENT=${ENVIRONMENT}
# Install git and wget also update databases
RUN apt-get update &&\
    apt-get install git -y &&\
    apt-get install wget && \
    apt-get install librdkafka-dev -y && \
    apt-get install cron -y
# Install drush globally
RUN	curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
	composer global require drush/drush && \
	composer global update && \
	ln -s /root/.composer/vendor/bin/drush /usr/local/bin/drush && \
	mkdir -p /app/drupal  && \
	chown -R www-data:www-data /app/drupal && \
	mkdir /run/apache2; exit 0 && \
	sed -i 's#^DocumentRoot ".*#DocumentRoot "/app/drupal/web"#g' /etc/apache2/httpd.conf && \
	sed -i 's#/var/www/localhost/htdocs#/app/drupal/web#' /etc/apache2/httpd.conf && \
	sed -i 's#AllowOverride None#AllowOverride All#' /etc/apache2/httpd.conf && \
  apk del ${BUILD_DEPS} php8-pear php8-dev && \
	echo "Success"
# Install pickle for phpextensions \
RUN cd /root &&\
    wget https://github.com/FriendsOfPHP/pickle/releases/latest/download/pickle.phar &&  \
    chmod +x pickle.phar && \
    mv pickle.phar /usr/bin/pickle && \
    pickle install redis --defaults && \
    pickle install rdkafka && \
    docker-php-ext-enable redis && \
    docker-php-ext-enable rdkafka && \
    a2enmod headers && \
    sed -ri -e 's/^([ \t]*)(<\/VirtualHost>)/\1\tHeader set Access-Control-Allow-Origin "*"\n\1\2/g' /etc/apache2/sites-available/*.conf


ADD apache2.conf /apache2.conf
RUN mv /apache2.conf /etc/apache2/apache2.conf
#
ADD run.sh /run.sh
RUN chmod +x /run.sh
#
ADD php.ini /php.ini
RUN mv /php.ini /usr/local/etc/php/
#
ADD auth.conf /auth.conf
RUN mv /auth.conf /etc/apache2/conf-available/auth.conf
#
ADD crontab.txt /crontab.txt
RUN /usr/bin/crontab -u www-data /crontab.txt

#
RUN mkdir /scripts
ADD crontask.sh /scripts/crontask.sh
RUN chown www-data:www-data /scripts/crontask.sh
RUN chmod +x /scripts/crontask.sh
RUN ln -s /usr/local/bin/php /usr/bin/php


EXPOSE 8080
#
WORKDIR /app/drupal
#
ENTRYPOINT ["/run.sh"]
