Config Ignore
=============

INTRODUCTION
------------
Ever experienced that your sites configuration was overridden by the configuration on the filesystem, when doing a
`drush cim`?

Not anymore!

This modules is a tool to let you keep the configuration you want, in place.

Lets say that you do would like the `system.site` configuration (which contains that sites name, slogan, email, etc) to
remain untouched, on your live site, no matter what the configuration, in the export folder says.

Or maybe you are getting tired of having the `devel.settings` changed every time you import configuration?

Then this module is what you are looking for.

REQUIREMENTS
------------
You will need the `config_filter` module to be enabled.

INSTALLATION
------------
Consult https://www.drupal.org/docs/8/extending-drupal-8/installing-contributed-modules-find-import-enable-configure-drupal-8
to see how to install and manage modules in Drupal 8.

CONFIGURATION
-------------
Go to `admin/config/development/configuration/ignore` to set what configuration you want to ignore upon import.

Do not ignore the `core.extension` configuration as it will prevent you from enabling new modules with a config import.
Use the `config_split` module for environment specific modules.

MAINTAINERS
-----------
Current maintainers:

 * Tommy Lynge Jørgensen (TLyngeJ) - https://www.drupal.org/u/tlyngej
 * Fabian Bircher (bircher) - https://www.drupal.org/u/bircher
