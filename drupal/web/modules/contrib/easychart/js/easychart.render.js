(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.easychartRender = {
    attach: function(context, settings) {
      if (settings.easychart != undefined) {
        var charts = settings.easychart;
        $.each(charts, function(key) {
          var $container = $('.easychart-embed--' +  key)[0];
          window.easychart = new ec({element: $container});

          // Add configuration
          if (charts[key].config.length > 0) {
            var config = JSON.parse(charts[key].config);
            window.easychart.setConfig(config);
          }

          // Add data
          var csv = JSON.parse(charts[key].csv);
          window.easychart.setData(csv);

          // Add presets.
          if (charts[key].presets != null) {
            window.easychart.setPresets(JSON.parse(charts[key].presets.replace('\r\n', '')));
          }
        });
      }
    }
  }

})(jQuery, Drupal);
