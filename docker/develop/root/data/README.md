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

## postgres
  * *db* container volume mount on host

## stunnel
  * *htm-stunnel* container configuration mount on host
  * requires *.key, *.cert, stunnel.conf for *htm-stunnel* container to work (stunnel.conf provided)

## varnish
  * http accelerator a.k.a cache mechanism for drupal
  * requires default.vcl config file where a reference to drupal is provided among other configurations
  * nginx serves the backend container through varnish container
## web/sites
  * *drupal* container sites mount on host
  * primary host related settings found in *settings.php* file. (settings.php provided)