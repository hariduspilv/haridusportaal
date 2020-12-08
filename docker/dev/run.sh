#!/bin/sh

if [ ! -d /app/drupal/web ]; then

  cd /app
  git init
  git remote add origin https://github.com/hariduspilv/haridusportaal.git
  git fetch origin
  git checkout -b develop --track origin/develop
  git reset origin/develop
  if [ ! -d /app/drupal/web/sites ]; then
    cd /data
    cp -R web /app/drupal
  fi
  if [ -d /app/drupal/config/sync ]; then
    cd /app/drupal
    drush cim
  fi
fi

if [ -d /app/drupal/web ]; then
  
  cd /app
  git init
  git remote add origin https://github.com/hariduspilv/haridusportaal.git
  git fetch origin
  git checkout -b develop --track origin/develop
  git pull

fi

chown apache.apache -R /app/drupal/web/sites/default/files

/usr/sbin/crond -l 8

echo "[i] Starting daemon..."
httpd -D FOREGROUND
