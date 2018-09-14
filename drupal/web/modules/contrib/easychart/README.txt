
-- SUMMARY --

Easychart provides a way to create charts based on the powerful Highcharts library
(http://www.highcharts.com/products/highcharts).

This module:

* Defines a new Content Type named 'Chart' that allows you to add one or more charts to your website.
* Integrates with the Entity embed module and provides an editor button that allows you to add charts
  to your content.
* Gives you an easy interface to configure your charts through the Easychart jQuery plugin.

Attention:

Highcharts is free for personal, school or non-profit projects under the Creative Commons Attribution - Non Commercial
3.0 License. For commercial and governmental websites and projects, you need to buy a license. (But they're absolutely
worth every penny.) See http://shop.highsoft.com/highcharts.html.

-- INSTALLATION --

1. Download and install the Easychart module: https://drupal.org/project/easychart

2. If you use drush, then run 'drush easychart-dependencies' to install the latest Highcharts and Easychart plugins.

3. If you are not using drush, download the Highcharts plugin at http://www.highcharts.com/download and place it in
   /libraries/highcharts

4. If you are not using drush, download the v3 Easychart plugin at https://github.com/daemth/easychart and place
   it in /libraries/easychart. The result should be /libraries/easychart/dist/ec.full.js.


-- Editor integration: Entity Embed ---

If you install the Entity Embed module, you can automatically embed nodes which contains charts. An additional
display plugin inside Entity embed will be made available that only prints the chart itself and not the complete
entity.

See https://www.drupal.org/project/entity_embed

-- NOTES WHEN USING CSV DATA URL --

In the Easychart interface, you can choose to get your date from an external url. Make sure that there are no
cross-domain issues otherwise this functionality wil not work. For performance reasons, we cache the data from the url,
and only update this data when cron runs. You can overwrite the frequency by setting the variable
'easychart_url_update_frequency'.

-- VIEWS INTEGRATION --

If you want to expose data from your nodes to Easychart, you can follow these steps:

1. Download and install the Views Data Export module at https://www.drupal.org/project/views_data_export.

2. Create a View with a 'Data Export' display and 'CSV file' as Export type.

3. Set the path for that View, and use that path, including your domain name, as the 'url CSV' in the Easychart plugin.


-- POSSIBLE ISSUES --

1. I get a javascript error: 'uncaught exception: Highcharts error #13: www.highcharts.com/errors/13'
   The chart needs a div to be printed in. If your Text Format does not allow DIV's to be printed, you will get the
   error above, and the chart will not be printed.
   See step 4 under 'WYSIWYG PLUGIN' for the solution.

This project is sponsored by Bestuurszaken, Vlaamse Overheid: http://www.bestuurszaken.be

-- ACCESSIBILITY --

See https://www.drupal.org/node/2728809 on how to make your charts accessible. We have chosen not to do this by default for performance reasons.

-- CREDITS --

This project is sponsored by The Government of Flanders: http://overheid.vlaanderen.be.

The following libraries made this module possible:

1. Highcharts: http://highcharts.com/

2. screenfull.js: https://github.com/sindresorhus/screenfull.js

3. Handsontable: https://github.com/handsontable/handsontable
