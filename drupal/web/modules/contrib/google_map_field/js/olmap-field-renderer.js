/**
 * @file
 * JavaScript Google Map Field renderer.
 *
 * Renders a Google maps field in front end pages.
 */

var olmap_field_map;

(function ($, Drupal) {

  Drupal.behaviors.olmap_field_renderer = {
    attach: function (context) {

      $('.olmap-field .map-container').once('.olmap-field-processed').each(function (index, item) {
        // Get the settings for the map from the Drupal.settings object.
        var lat = $(this).attr('data-lat');
        var lon = $(this).attr('data-lon');
        var zoom = parseInt($(this).attr('data-zoom'));
        var show_marker = $(this).attr('data-marker-show') === "true";
        var show_controls = $(this).attr('data-controls-show') === "true";
        var info_window = $(this).attr('data-infowindow') === "true";
        var default_marker = $(this).attr('data-default-marker');

        // Create the feature that will hold the icon.
        var iconFeature = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
        });

        var iconStyle = new ol.style.Style({
          image: new ol.style.Icon({
            scale: 1,
            src: default_marker
          })
        });
        iconFeature.setStyle(iconStyle);

        // Get the icon feature ready for the map.
        var vectorSource = new ol.source.Vector({ features: [iconFeature] });

        // Add the Vector source to a layer source.
        var vectorLayer = new ol.layer.Vector({ source: vectorSource });

        // Create our map layer.
        var mapLayer = new ol.layer.Tile({ source: new ol.source.OSM() });

        // Create the map.
        var map = new ol.Map({
          layers: [ mapLayer, vectorLayer ],
          target: this,
            view: new ol.View({
              center: ol.proj.fromLonLat([lon, lat]),
              zoom: zoom
            })
        });

        // Define our map controls.
        if (show_controls) {
          var zoomCtl = new ol.control.Zoom({
            zoomInTipLabel: 'Zoom in',
            zoomOutTipLabel: 'Zoom out',
            className: 'ol-zoom'
          });
          var fullScreenCtl = new ol.control.FullScreen();
          var scaleLineCtl = new ol.control.ScaleLine();

          map.addControl(zoomCtl);
          map.addControl(fullScreenCtl);
          map.addControl(scaleLineCtl);
        }
      });

    }
  }

})(jQuery, Drupal);
