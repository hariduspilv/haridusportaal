CONTENTS OF THIS FILE
---------------------

-   Introduction
-   Please note
-   Requirements
-   Installation
-   Configuration
-   Troubleshooting
-   Maintainers
 

INTRODUCTION
------------

This module allows content creators/maintainers to add maps to content via the
addition of a "Google Map Field" field type that can be added to content types.

Using the google map field, the user can drop a marker on a map (manually or
searching for a location), customize map appearance and settings (zoom, map
type, width, height, enable/disable of controls, enable/disable of marker, set a
InfoWindow popup) and save the data for the map with the node (or other
fieldable entity).

-   For a full description of the module, visit the project page:
    <https://www.drupal.org/project/google_map_field>

-   To submit bug reports and feature suggestions, or to track changes:
    <https://www.drupal.org/project/issues/google_map_field>

Default formatter has limited usage. If you require free plugin for any number 
of loads, use "Google Map Field Embed Place" field formatter.
 
-   For more information about different types of Google Map embeds:
    <https://developers.google.com/maps/documentation/embed/guide#view_mode>

-   For more information about Google Map pricing:
    <https://developers.google.com/maps/billing/understanding-cost-of-use>



PLEASE NOTE
-----------

This module is for D8, it was initially an evolution of the D7 version, but has
followed a different path in terms of functionalities. Most of them are not
backported to D7.

 

REQUIREMENTS
------------

This module works on Drupal 8 with only dependent on having an Google Maps API
Key.

 

INSTALLATION
------------

Google map field can be installed like any other Drupal module - place it in the
modules directory for your site and enable it on the page navigation to
Administration \> Extend.

 

CONFIGURATION
-------------

-   Get api key or get client ID
    (<https://developers.google.com/maps/documentation/javascript/get-api-key>)

-   Navigate to Administration \> Configuration \> Web services \> Google Maps
    API Key configuration, and add your key or client id.

-   To use it you simply add the "Google Map Field" to the entity on which you
    wish to use it  

 

TROUBLESHOOTING
---------------

If the map is not being displayed, check the following:

-   Do you have a configured and valid Google Maps API Key?

-   Did you configured the “marker” options in the content map field?

-   Did you upgrade from a previous release? If so check the release notes for
    upgrade steps.

-   Do you have any Javascript errors on the page you have the map?

 

MAINTAINERS
-----------

Current maintainers:

-   Scot Hubbard (scot.hubbard) - <https://www.drupal.org/u/scothubbard>
-   Paulo Gomes (pauloamgomes) - <https://www.drupal.org/u/pauloamgomes>
