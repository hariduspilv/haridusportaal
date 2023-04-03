#!/bin/bash

cd /app
git init
git remote add origin https://github.com/hariduspilv/haridusportaal.git

if [[ "$ENVIRONMENT" == "Development" ]]; then

ln -s /app/drupal/vendor/bin/drush /usr/local/bin/drush
echo "$ENVIRONMENT"
git fetch origin
git checkout -b develop --track origin/develop

if [[ ! -d /app/drupal/web ]]; then
git reset origin/develop
if [[ ! -d /app/drupal/web/sites ]]; then
cd /data
cp -R web /app/drupal
fi
if [[ -d /app/drupal/config/sync ]]; then
cd /app/drupal
drush cex -y
drush cim
fi
else
git pull
fi

else
git fetch --tags
git reset --hard "$BUILD_VERSION"
cd /app/drupal
composer install

ln -s /app/drupal/vendor/bin/drush /usr/local/bin/drush
drush cr

fi


# source directory
src_dir="/app/drupal/web/sites/live-conf"

# destination directory
dst_dir="/app/drupal/config/sync"

# list of files to copy
file_list=("core.menu.static_menu_link_overrides.yml"
           "openid_connect.settings.harid.yml"
           "openid_connect.settings.tara.yml"
           "smtp.settings.yml"
           "system.logging.yml"
           "system.site.yml")

# check if source directory exists
if [ ! -d "${src_dir}" ]
then
  echo "Source directory ${src_dir} does not exist"
fi

# check if destination directory exists
if [ ! -d "${dst_dir}" ]
then
  echo "Destination directory ${dst_dir} does not exist"
fi

# loop through each file in the list and copy it to the destination directory
for file in "${file_list[@]}"
do
  # check if source file exists
  if [ ! -f "${src_dir}/${file}" ]
  then
    echo "Source file ${src_dir}/${file} does not exist"
  else
    cp "${src_dir}/${file}" "${dst_dir}"
    echo "Copied ${file} to ${dst_dir}"
  fi
done
cd /app/drupal
drush entup -y

Copy the files required for composer install & run composer install
Copy the installed files required for scripts & run scripts
(https://www.sentinelstand.com/article/composer-install-in-dockerfile-without-breaking-cache)
echo "composer install"
cp composer.json ./
cp composer.lock ./
composer install --no-scripts --no-autoloader --no-dev
cp . ./
composer dump-autoload --optimize &&
composer run-script post-install-cmd

drush cr


echo "importing translations"
drush php-eval "htm_custom_translations_new_import_translations()"

chown -R www-data:www-data /app/drupal/web/sites/default/files
chmod -R 764 /app/drupal/web/sites/default/files/php
chmod -R 764 /app/drupal/web/sites/default/files/logs

echo "[i] Starting daemon..."
cron
apache2-foreground
