# Data folder on the server (host)

## backups
  * used for storing backup files / dumps / files transferred from elsewhere.

## javaApp
  * *htm-liides* container volume mount on host
  * add xRoad-0.0.1-SNAPSHOT.jar from github to initialize *htm-liides* container
  * holds *htm-liides* conf files

## postgres
  * *db* container volume mount on host

## stunnel
  * *htm-stunnel* container configuration mount on host
  * requires *.key, *.cert, stunnel.conf for *htm-stunnel* container to work (stunnel.conf provided)

## web/sites
  * *drupal* container sites mount on host
  * primary host related settings found in *settings.php* file. (settings.php provided)