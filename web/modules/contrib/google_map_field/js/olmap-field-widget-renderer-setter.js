/**
 * @file
 * JavaScript renderer for Google Map Field popup.
 *
 * Renders the settings popup for a Google Maps Field.
 */

(function ($) {

  var dialog;
  var olmap_field_map;

  olMapFieldSetter = function (delta, context) {

    btns = {};

    btns[Drupal.t('Insert map')] = function () {
      var lonlat = new ol.proj.toLonLat(iconMarker.getCoordinates());
      var zoom = $('#edit-zoom').val();;
      var type = $('#edit-type').val();
      var width = $('#edit-width').val();
      var height = $('#edit-height').val();
      var show_marker = $('#edit-marker').prop('checked') ? "1" : "0";
      var marker_icon = $('#edit-marker-icon').val();
      var default_icon = $('#edit-default-marker-icon').val();
      var show_controls = $('#edit-controls').prop('checked') ? "1" : "0";
      var infowindow_text = $('#edit-infowindow').val();

      $('input[data-lat-delta="' + delta + '"]').prop('value', lonlat[1]).attr('value', lonlat[1]);
      $('input[data-lon-delta="' + delta + '"]').prop('value', lonlat[0]).attr('value', lonlat[0]);
      $('input[data-zoom-delta="' + delta + '"]').prop('value', zoom).attr('value', zoom);
      $('input[data-type-delta="' + delta + '"]').prop('value', type).attr('value', type);
      $('input[data-width-delta="' + delta + '"]').prop('value', width).attr('value', width);
      $('input[data-height-delta="' + delta + '"]').prop('value', height).attr('value', height);
      $('input[data-marker-delta="' + delta + '"]').prop('value', show_marker).attr('value', show_marker);
      $('input[data-default-marker-delta="' + delta + '"]').prop('value', default_icon).attr('value', default_icon);
      $('input[data-marker-icon-delta="' + delta + '"]').prop('value', marker_icon).attr('value', marker_icon);
      $('input[data-controls-delta="' + delta + '"]').prop('value', show_controls).attr('value', show_controls);
      $('input[data-infowindow-delta="' + delta + '"]').prop('value', infowindow_text).attr('value', infowindow_text);

      olMapFieldPreviews(delta, context);

      $(this).dialog("close");
    };

    btns[Drupal.t('Cancel')] = function () {
      $(this).dialog("close");
    };

    var dialogHTML = '';
    dialogHTML += '<div id="olmap_field_dialog">';
    dialogHTML += '  <div>' + Drupal.t('Use the map below to drop a marker at the required location.') + '</div>';
    dialogHTML += '  <div id="olmap_field_container">';
    dialogHTML += '    <div id="olmap_map_container">';
    dialogHTML += '      <div id="olmf_container"></div>';
    dialogHTML += '    </div>';
    dialogHTML += '    <div id="olmap_field_options">';
    dialogHTML += '      <label for="edit-zoom">' + Drupal.t('Map Zoom') + '</label>';
    dialogHTML += '      <select class="form-select" id="edit-zoom" name="field_zoom"><option value="1">' + Drupal.t('1 (Min)') + '</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">' + Drupal.t('9 (Default)') + '</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option>option value="21">' + Drupal.t('21 (Max)') + '</option></select>';
    dialogHTML += '      <input id="edit-type" name="field_type" type="hidden" value="" />';
    dialogHTML += '      <label for="edit-width">' + Drupal.t('Map Width') + '</label>';
    dialogHTML += '      <input type="text" id="edit-width" size="5" maxlength="6" name="field-width" value="" />';
    dialogHTML += '      <label for="edit-height">' + Drupal.t('Map Height') + '</label>';
    dialogHTML += '      <input type="text" id="edit-height" size="5" maxlength="6" name="field-height" value="" />';
    dialogHTML += '      <div class="form-checkbox">';
    dialogHTML += '        <input type="checkbox" class="form-checkbox" id="edit-controls" name="field_controls" />';
    dialogHTML += '        <label for="edit-controls">' + Drupal.t('Enable controls') + '</label>';
    dialogHTML += '      </div>';
    dialogHTML += '      <div class="form-checkbox">';
    dialogHTML += '        <input type="checkbox" class="form-checkbox" id="edit-marker" name="field_marker" />';
    dialogHTML += '        <label for="edit-marker">' + Drupal.t('Enable marker') + '</label>';
    dialogHTML += '      </div>';
    dialogHTML += '      <input type="hidden" id="edit-marker-icon" name="field_marker_icon" value="" />';
    dialogHTML += '    </div>';
    dialogHTML += '  </div>';
    dialogHTML += '  <div id="infowindow_container">';
    dialogHTML += '    <label for="edit-infowindow">' + Drupal.t('InfoWindow Popup text: (optional)') + '</label>';
    dialogHTML += '    <textarea class="form-textarea" id="edit-infowindow" name="infowindow" rows="3" style="width: 100%;"></textarea>';
    dialogHTML += '  </div>';
    dialogHTML += '</div>';

    $('body').append(dialogHTML);

    dialog = $('#olmap_field_dialog').dialog({
      modal: true,
      autoOpen: false,
      width: 750,
      height: 640,
      closeOnEscape: true,
      resizable: false,
      draggable: false,
      title: Drupal.t('Set Map Marker'),
      dialogClass: 'jquery_ui_dialog-dialog',
      buttons: btns,
      close: function (event, ui) {
        $(this).dialog('destroy').remove();
      }
    });

    dialog.dialog('open');

    // Handle map options inside dialog.
    $('#edit-zoom').change(function () {
      mapView.setZoom(olMapFieldValidateZoom($(this).val()));
    })
    $('#edit-controls').change(function () {
      if ($(this).prop('checked')) {
        map.addControl(zoomCtl);
        map.addControl(fullScreenCtl);
        map.addControl(scaleLineCtl);
      }
      else {
        map.removeControl(zoomCtl);
        map.removeControl(fullScreenCtl);
        map.removeControl(scaleLineCtl);
      }
    })
    $('#edit-marker').change(function () {
      vectorLayer.setVisible( $(this).prop('checked') );
    })

    // Create the map setter map.
    // get the lat/lon from form elements.
    var map_name = $('input[data-name-delta="' + delta + '"]').attr('value');
    var lat = $('input[data-lat-delta="' + delta + '"]').attr('value');
    var lon = $('input[data-lon-delta="' + delta + '"]').attr('value');
    var zoom = $('input[data-zoom-delta="' + delta + '"]').attr('value');
    var type = $('input[data-type-delta="' + delta + '"]').attr('value');
    var width = $('input[data-width-delta="' + delta + '"]').attr('value');
    var height = $('input[data-height-delta="' + delta + '"]').attr('value');
    var show_marker = $('input[data-marker-delta="' + delta + '"]').val() === "1";
    var marker_icon = $('input[data-marker-icon-delta="' + delta + '"]').attr('value');
    var default_icon = $('input[data-default-marker-delta="' + delta + '"]').val();
    var show_controls = $('input[data-controls-delta="' + delta + '"]').val() === "1";
    var infowindow_text = $('input[data-infowindow-delta="' + delta + '"]').attr('value');

    lat = olMapFieldValidateLat(lat);
    lon = olMapFieldValidateLon(lon);
    zoom = olMapFieldValidateZoom(zoom);

    $('#edit-zoom').val(zoom);
    $('#edit-type').val(type);
    $('#edit-width').prop('value', width).attr('value', width);
    $('#edit-height').prop('value', height).attr('value', height);
    $('#edit-marker').prop('checked', show_marker);
    $('#edit-marker-icon').val(marker_icon);
    $('#edit-controls').prop('checked', show_controls);
    $('#edit-infowindow').val(infowindow_text);

    // Create our marker icon.
    if (marker_icon === "") {
      var iconImg = default_icon;
    }
    else {
      var iconImg = marker_icon;
    }

    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon({
        scale: 1,
        src: iconImg
      })
    });

    var iconMarker = new ol.geom.Point( ol.proj.fromLonLat([lon, lat]) );
    var iconFeature = new ol.Feature(iconMarker);

    // Add the Vector source to a layer source.
    var vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [ iconFeature ]
      }),
      style: [ iconStyle ]
    });

    // Create our map layer.
    var mapLayer = new ol.layer.Tile({ source: new ol.source.OSM() });

    // Creat ethe map view.
    var mapView = new ol.View({
      center: ol.proj.fromLonLat([lon, lat]),
      zoom: zoom,
      maxZoom: 18
    })

    // Define our map controls.
    var zoomCtl = new ol.control.Zoom({
      zoomInTipLabel: 'Zoom in',
      zoomOutTipLabel: 'Zoom out',
      className: 'ol-zoom'
    });
    var fullScreenCtl = new ol.control.FullScreen();
    var scaleLineCtl = new ol.control.ScaleLine();

    // Create the map.
    var map = new ol.Map({
      controls: [ zoomCtl, fullScreenCtl, scaleLineCtl ],
      layers: [ mapLayer, vectorLayer ],
      target: document.getElementById("olmf_container"),
      view: mapView
    });

    var translate = new ol.interaction.Translate({
      features: new ol.Collection([iconFeature])
    });

    var iconCoords;
    translate.on('translateend', function (evt) {
      iconCoords = iconMarker.getCoordinates();
      mapView.animate({
        center: iconCoords,
        duration: 1000,
      });
    });

    map.addInteraction(translate);

    map.on('pointermove', function (e) {
      if (e.dragging) {
        return;
      }
      var hit = map.hasFeatureAtPixel(map.getEventPixel(e.originalEvent));
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    // Add map listener to drop marker and wire-up settings.
    map.on('click', function (evt) {
      iconMarker.setCoordinates(evt.coordinate);
      iconCoords = iconMarker.getCoordinates();
      mapView.animate({
        center: iconCoords,
        duration: 1000,
      });
      evt.preventDefault();
    });

    // Get current zoom level.
    map.on('moveend', function (e) {
      $('#edit-zoom').val(Math.trunc(map.getView().getZoom()));
    });

    return false;
  }

})(jQuery);
