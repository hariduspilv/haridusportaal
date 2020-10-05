/**
 * @file
 * JavaScript code to update Google Map Field from settings popup.
 */

(function ($, Drupal) {

  Drupal.behaviors.olmap_field_widget_renderer = {
    attach: function (context, settings) {

      // Code here to read fields and set maps accordingly on page load.
      olMapFieldPreviews(-1, context);

      $('.olmap-field-clear').bind('click', function (event) {
        event.preventDefault();
        var data_delta = $(this).attr('data-delta');
        $('input[data-name-delta="' + data_delta + '"]').prop('value', '').attr('value', '');
        $('input[data-lat-delta="' + data_delta + '"]').prop('value', '').attr('value', '');
        $('input[data-lon-delta="' + data_delta + '"]').prop('value', '').attr('value', '');
        $('input[data-zoom-delta="' + data_delta + '"]').prop('value', '').attr('value', 9);
        $('input[data-traffic-delta="' + data_delta + '"]').prop('value', '').attr('value', 0);
        $('input[data-marker-delta="' + data_delta + '"]').prop('value', '').attr('value', 1);
        $('input[data-marker-icon-delta="' + data_delta + '"]').prop('value', '').attr('value', '');
        $('input[data-type-delta="' + data_delta + '"]').prop('value', '').attr('value', 'roadmap');
        olMapFieldPreviews(data_delta);
      });

      $('.olmap-field-watch-change').change(function (event) {
        var data_delta = $(this).attr('data-lat-delta') || $(this).attr('data-lon-delta') || $(this).attr('data-zoom-delta') || $(this).attr('data-type-delta');
        olMapFieldPreviews(data_delta, context);
      });

    }
  }

})(jQuery, Drupal);
