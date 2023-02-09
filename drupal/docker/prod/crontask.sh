#!/bin/sh
cd /app/drupal
/app/drupal/vendor/bin/drush core-cron --root=/app/drupal --uri=localhost:8080
