
(function (Drupal, $) {

  'use strict';

  Drupal.behaviors.editor_advanced_link = {
    attach: function (context, settings) {
      // Reset modal window position when advanced details element is opened or
      // closed to prevent the element content to be out of the screen.
      $('.editor-link-dialog details[data-drupal-selector="edit-advanced"]').once('editor_advanced_link')
        .on('toggle', function () {
          $("#drupal-modal").dialog({
            position: {
              of: window
            }
          });
      });
    }
  };

}(Drupal, jQuery));
