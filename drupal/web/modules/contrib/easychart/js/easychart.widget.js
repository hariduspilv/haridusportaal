(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.easychartWidget = {
    attach: function(context, settings) {

      // Create the Easychart plugin options based on the admin configuration.
      var $widgets = $('.easychart-wrapper:not(".ec-processed")');
      if ($($widgets).length > 0) {

        $widgets.each(function () {
          var $widget = $(this);
          $widget.addClass('ec-processed');
          var ecConfig = {};
          ecConfig.element = $('.easychart-embed', $widget)[0];

          // Set the config.
          if ($('.easychart-config', $widget).val()) {
            ecConfig.config = JSON.parse($('.easychart-config', $widget).val());
          }

          // Set the data or csv url.
          if ($('.easychart-csv-url', $widget).val()) {
            ecConfig.dataUrl = $('.easychart-csv-url', $widget).val();
          }
          else
            if ($('.easychart-csv', $widget).val()) {
              ecConfig.data = JSON.parse($('.easychart-csv', $widget).val());
            }

          // Set the options.
          if (settings.easychart != undefined) {
            if (settings.easychart.easychartOptions) {
              ecConfig.options = JSON.parse(settings.easychart.easychartOptions.replace('\r\n', ''));
            }

            // Set the templates.
            if (settings.easychart.easychartTemplates) {
              ecConfig.templates = JSON.parse(settings.easychart.easychartTemplates.replace('\r\n', ''));
            }

            // Set the presets.
            if (settings.easychart.easychartPresets) {
              ecConfig.presets = JSON.parse(settings.easychart.easychartPresets.replace('\r\n', ''));
            }

            // Build the UI, based on permissions.
            if (settings.easychart.easychartCustomize == true) {
              ecConfig.customise = true;
            }
          }

          window.easychart = new ec(ecConfig);

          // Listen to updates in the Easychart config.
          window.easychart.on('dataUpdate', function (data) {
            $('.easychart-csv', $widget).val(JSON.stringify(data));

            // Check if an url was set and store that too.
            if (window.easychart.getDataUrl()) {
              $('.easychart-csv-url', $widget).val(window.easychart.getDataUrl());
            }
          });

          window.easychart.on('configUpdate', function (config) {
            $('.easychart-config', $widget).val(JSON.stringify(config));
          });

          // Toggle fullscreen.
          $('.toggle', $widget).click(function () {
            if (screenfull.enabled) {
              if (!screenfull.isFullscreen) {
                screenfull.request($widget[0]);
              }
              else {
                screenfull.exit();
              }
            }
          });
        });
      }
    }
 }

})(jQuery, Drupal);
