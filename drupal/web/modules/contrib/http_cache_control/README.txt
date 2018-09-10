CONTENTS OF THIS FILE
---------------------

 * Introduction
 * Requirements
 * Recommended modules
 * Installation
 * Configuration
 * Maintainers


INTRODUCTION
------------

HTTP Cache Control module helps fine tune control of Drupal's Cache Control headers.

## Features
* Support for shared cache max age (s-maxage)
* Ability to set cache lifetime of 404 pages

* For a full description of the module, visit the project page:
  https://www.drupal.org/project/http_cache_control

* To submit bug reports and feature suggestions, or to track changes:
  https://www.drupal.org/project/issues/http_cache_control?categories=All


REQUIREMENTS
------------

No special requirements. Simply add and install the module.


RECOMMENDED MODULES
-------------------

The Purge module (https://www.drupal.org/project/http_cache_control) enables Drupal to
purge cached pages stored in reverse proxies such as Varnish. This module can be
used to ensure reverse proxies contain long cache lifetimes while ensuring browsers
do not cache pages for too long.

INSTALLATION
------------

 * Install as you would normally install a contributed Drupal module.
   See: https://www.drupal.org/docs/8/extending-drupal-8/installing-drupal-8-modules for further information.


CONFIGURATION
-------------

Go to Drupal's performance page in the Site Configuration and set the cache
lifetimes accordingly.


MAINTAINERS
-----------

Current maintainers:
 * Josh Waihi - https://www.drupal.org/u/josh-waihi
