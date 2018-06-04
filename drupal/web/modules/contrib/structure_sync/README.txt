CONTENTS OF THIS FILE
---------------------

 * Introduction
 * Requirements
 * Installation
 * Configuration
 * Maintainers


INTRODUCTION
------------

The Structure Sync module provides Drush commands and admin interface screens
for synchronizing content that could also be considered configuration. Including
menu items, custom blocks and taxonomy terms.


 * For a full description of the module visit:
   https://www.drupal.org/project/structure_sync

 * To submit bug reports and feature suggestions, or to track changes visit:
   https://www.drupal.org/project/issues/structure_sync


REQUIREMENTS
------------

This module requires no modules outside of Drupal core.


INSTALLATION
------------

 * Install the Structure Sync module as you would normally install a
   contributed Drupal module. Visit https://www.drupal.org/node/1897420 for
   further information.


CONFIGURATION
-------------

 * Navigate to Administration > Extend and enable the module.

The available Drush commands are:

 * export-taxonomies (et) - Export taxonomy terms to configuration
 * import-taxonomies (it) - Import taxonomy terms from configuration
 * export-blocks (eb) - Export custom blocks to configuration
 * import-blocks (ib) - Import custom blocks from configuration
 * export-menus (em) - Export menu links to configuration
 * import-menus (im) - Import menu links from configuration
 * export-all (ea) - Export taxonomy terms, custom blocks and menu links to
   configuration
 * import-all (ia) - Import taxonomy terms, custom blocks and menu links from
   configuration

The access to the admin screens is restricted with the permission to
'Administer site configuration'.

The available admin interface screens are:

 * General options for this module - /admin/structure/structure-sync/general
 * Import/export taxonomy  - terms/admin/structure/structure-sync/taxonomies
 * Import/export custom blocks - /admin/structure/structure-sync/blocks
 * Import/export menu links - /admin/structure/structure-sync/menu-links


MAINTAINERS
-----------

 * Tim Kruijsen (timKruijsen) - https://www.drupal.org/u/timkruijsen
 * Fido van den Bos (fidodido06) - https://www.drupal.org/u/fidodido06

Supporting organization:

 * Ordina Digital Services - https://www.drupal.org/ordina-digital-services
