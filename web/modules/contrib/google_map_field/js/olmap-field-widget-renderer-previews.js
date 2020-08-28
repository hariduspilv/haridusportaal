/**
 * @file
 * JavaScript OpenLayers Map Field Preview Renderer.
 *
 * Renders a preview of a OpenLayers Maps Field in entity edit forms.
 */

(function ($, Drupal) {

  olMapFieldPreviews = function (delta, context) {

    delta = typeof delta === 'undefined' ? -1 : delta;

    $('.olmap-field-preview', context).each(function () {
      var data_delta = $(this).attr('data-delta');

      if (data_delta == delta || delta == -1) {

        // Remove any previous map.
        $('.olmap-field-preview[data-delta="' + data_delta + '"] .ol-viewport').remove();

        var data_name = $('input[data-name-delta="' + data_delta + '"]').val();
        var data_lat = $('input[data-lat-delta="' + data_delta + '"]').val();
        var data_lon = $('input[data-lon-delta="' + data_delta + '"]').val();
        var data_zoom = $('input[data-zoom-delta="' + data_delta + '"]').attr('value');
        var data_default_marker = $('input[data-default-marker-delta="' + data_delta + '"]').val();
        var data_marker = $('input[data-marker-delta="' + data_delta + '"]').val() === "1";
        var show_controls = $('input[data-controls-delta="' + data_delta + '"]').val() === "1";

        data_lat = olMapFieldValidateLat(data_lat);
        data_lon = olMapFieldValidateLon(data_lon);
        data_zoom = olMapFieldValidateZoom(data_zoom);

        // Create the feature that will hold the icon.
        var iconFeature = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([data_lon, data_lat])),
          name: data_name,
        });

        var iconStyle = new ol.style.Style({
          image: new ol.style.Icon({
            scale: 1,
            src: data_default_marker
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
              center: ol.proj.fromLonLat([data_lon, data_lat]),
              zoom: data_zoom
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

        $('#map_setter_' + data_delta).unbind();
        $('#map_setter_' + data_delta).bind('click', function (event) {
          event.preventDefault();
          olMapFieldSetter($(this).attr('data-delta'), context);
        });

      }

    });
    // End .each.
  }

  olMapFieldValidateLat = function (lat) {
    lat = parseFloat(lat);
    if (lat >= -90 && lat <= 90) {
      return lat;
    }
    else {
      return '51.524295';
    }
  }

  olMapFieldValidateLon = function (lon) {
    lon = parseFloat(lon);
    if (lon >= -180 && lon <= 180) {
      return lon;
    }
    else {
      return '-0.127990';
    }
  }

  olMapFieldValidateZoom = function (zoom) {
    zoom = parseInt(zoom);
    if (zoom === null || zoom === '' || isNaN(zoom)) {
      return '9';
    }
    else {
      return zoom;
    }
  }

})(jQuery);
