# Data folder on the server (host)

## backups
  * used for storing backup files / dumps / files transferred from elsewhere.

## javaApp
  * *liides* container volume mount on host
  * add xRoad-0.0.1-SNAPSHOT.jar from github to initialize *liides* container
  * holds *liides* conf files

## postgres
  * *db* container volume mount on host

## stunnel
  * *stunnel* container configuration mount on host
  * requires *.key, *.cert, stunnel.conf for *stunnel* container to work (stunnel.conf example provided)

## web/sites
  * *drupal* container sites mount on host
  * primary host related settings found in *settings.php* file. 