# Data folder on the server (host)

## backups
  * used for storing backup files / dumps / files transferred from elsewhere.

## elasticsearch
  * *elasticsearch* container mount on the host
  * stores elasticsearch node data

## javaApp
  * *htm-liides* container configuration and logs mount on host
  * requires the following to setup (example files provided):
    1. xRoad-0.0.1-SNAPSHOT.jar from github
    2. conf directory which includes *xroad.properties*, *log4j.properties*, *application.properties*
      * xroad.properties need to match service provider defined in *stunnel.conf*
    3. conditional plumbr.jar file in /plumbr subdirectory if plumbr is provided in container env variables.

## logrotate
  * configurations for log rotations
  * rotation conf for nginx inside swag container: keeps last 12 weeks of logs

## postgres
  * *db* container volume mount on host

## stunnel
  * *htm-stunnel* container configuration mount on host
  * requires *.key, *.cert, stunnel.conf for *htm-stunnel* container to work (stunnel.conf provided)

## swag
  * secure web application gateway - full fledged web server and reverse proxy that includes Nginx, Php7, Certbot and Fail2ban
  * automates retrieval and management of free SSL certs
  * requires nginx config files after certificates and folder structure have been generated: /root/data/swag/nginx/nginx.conf and /site-confs/default

## varnish
  * http accelerator a.k.a cache mechanism for drupal
  * requires default.vcl config file where a reference to drupal is provided among other configurations
  * nginx serves the backend container through varnish container

## web/sites
  * *drupal* container sites mount on host
  * primary host related settings found in *settings.php* file. (settings.php provided)
  * *default* site folder inside *web/sites* needs to have *live-conf* directory for prelive / live containers to work