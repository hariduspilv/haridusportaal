#!/bin/sh

cd /app
git init
git remote add origin https://github.com/hariduspilv/haridusportaal.git

if [ $ENVIRONMENT == "Development" ]; then

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
      drush cim
    fi
  else 
    git pull
  fi

else

  git fetch --tags
  git reset --hard $BUILD_VERSION

  if [ $ENVIRONMENT == "Live" ]; then
    echo $ENVIRONMENT
    cd /app/drupal
    drush cex -y
    cp /app/drupal/config/sync/htm_custom_variables.variable.yml /app/drupal/web/sites/default/live-conf/
    cp /app/drupal/config/sync/htm_custom_translations_new.translation.yml /app/drupal/web/sites/default/live-conf/
    cp /app/drupal/config/sync/htm_custom_authentication.customauthsetting.yml /app/drupal/web/sites/default/live-conf/
  fi

  if [ $ENVIRONMENT == "Prelive" ]; then
    echo $ENVIRONMENT
    cd /app/drupal
    drush cex -y
    cp /app/drupal/config/sync/htm_custom_variables.variable.yml /app/drupal/web/sites/default/live-conf/
    cp /app/drupal/config/sync/htm_custom_translations_new.translation.yml /app/drupal/web/sites/default/live-conf/
  fi

  cd /app
  git reset --hard $BUILD_VERSION

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
drush cr

drush php-eval "htm_custom_translations_new_import_translations()"

chown apache.apache -R /app/drupal/web/sites/default/files

if [ -d /plumbr-agent-installer ] && [[ $ENVIRONMENT == "Live" ]]; then
  /plumbr-agent-installer/PlumbrAgentInstaller --unpack-only --cluster-id="Drupal-${ENVIRONMENT}"
  /lib/ld-musl-x86_64.so.1 -- /opt/plumbr-agent/plumbrd & 
  export LD_PRELOAD=/opt/plumbr-agent/libplumbrmonitor.so
fi

/usr/sbin/crond -l 8

echo "[i] Starting daemon..."
httpd -D FOREGROUND
