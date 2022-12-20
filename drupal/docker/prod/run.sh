#!/bin/sh

cd /app
git init
git remote add origin https://github.com/hariduspilv/haridusportaal.git

if [ "$ENVIRONMENT" = "Development" ]; then

  echo $ENVIRONMENT
  git fetch origin
  git checkout -b develop --track origin/develop

  if [ ! -d /app/drupal/web ]; then
    git reset origin/develop
    if [ ! -d /app/drupal/web/sites ]; then
      cd /data
      cp -R web /app/drupal
    fi
    if [ -d /app/drupal/config/sync ]; then
      cd /app/drupal
      drush cex -y
      drush cim
    fi
  else
    git pull
  fi

else

  git fetch --tags
  git reset --hard $BUILD_VERSION
  cd /app/drupal
  composer install
  if [ "$ENVIRONMENT" = "Live" ]; then
    echo $ENVIRONMENT
    cd /app/drupal
    drush cex -y
    cp /app/drupal/config/sync/htm_custom_variables.variable.yml /app/drupal/web/sites/default/live-conf/
    cp /app/drupal/config/sync/htm_custom_translations_new.translation.yml /app/drupal/web/sites/default/live-conf/
    cp /app/drupal/config/sync/htm_custom_authentication.customauthsetting.yml /app/drupal/web/sites/default/live-conf/
  fi

  if [ "$ENVIRONMENT" = "Prelive" ]; then
    echo $ENVIRONMENT
    cd /app/drupal
    drush cex -y
    cp /app/drupal/config/sync/htm_custom_variables.variable.yml /app/drupal/web/sites/default/live-conf/
    cp /app/drupal/config/sync/htm_custom_translations_new.translation.yml /app/drupal/web/sites/default/live-conf/
  fi

  cd /app
  git reset --hard $BUILD_VERSION
  cd /app/drupal
  composer install
  if [ -d /app/drupal/web/sites/default/live-conf ]; then
    cd /app/drupal/web/sites/default/live-conf
    cp * /app/drupal/config/sync/
  fi

  if [ -d /app/drupal/config/sync ]; then
    cd /app/drupal
    drush cim
  fi
fi

cd /app/drupal
drush entup -y

# Copy the files required for composer install & run composer install
# Copy the installed files required for scripts & run scripts
# (https://www.sentinelstand.com/article/composer-install-in-dockerfile-without-breaking-cache)
echo "composer install"
cp composer.json ./
cp composer.lock ./
composer install --no-scripts --no-autoloader --no-dev
cp . ./
composer dump-autoload --optimize && \
	composer run-script post-install-cmd

drush cr

echo "importing translations"
drush php-eval "htm_custom_translations_new_import_translations()"

chown -R www-data:www-data /app/drupal/web/sites/default/files
chmod -R 764 /app/drupal/web/sites/default/files/php
chmod -R 764 /app/drupal/web/sites/default/files/logs


echo "[i] Starting daemon..."
apache2-foreground
