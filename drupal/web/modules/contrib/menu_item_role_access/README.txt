Menu Item Role Access

INTRODUCTION
------------

Provides a the ability to restrict access to menu items by the users role

REQUIREMENTS
------------

This module requires the following modules to be installed:

 * menu_link_content
 * menu_ui

INSTALLATION
------------

 * Install as you would normally install a contributed Drupal module. See:
   https://www.drupal.org/docs/8/extending-drupal-8/installing-drupal-8-modules
   for further information.

CONFIGURATION
-------------

 * Go to the menu item you wish to restrict within the admin UI and select the 
   roles which should have access to the menu item.
 * Configuration options for the way menu_item_role_access behaves can be found
   at admin/config/menu-item-role-access

TROUBLESHOOTING
---------------

Trouble:
 * User see menu item, but his role not allowed for this menu item.
 * User don't see menu item, but his role allowed for this menu item.
Fix:
 By default, Drupal permissions are used (/admin/people/permissions).
 This means that menu item will be displayed for role that have view permissions, even if you set a limit for this menu item in "Menu Item Role".
 Also, the menu item will not be shown if the role does not have a Drupal permissions to view menu item.
 To fix this:
 - Navigate to admin/config/menu-item-role-access and press "Overwrite internal link target access check".
 - Clear the cache.
 - Enjoy.

MAINTAINERS
-----------

Current maintainers:
 * Liam Hiscock (LiamPower) - https://www.drupal.org/u/liampower
