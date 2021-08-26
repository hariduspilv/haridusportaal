
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
      //Add noopener to rel attribute if open link in new window checkbox is checked
      if($('input[data-drupal-selector="edit-attributes-rel"]').length) {
        $('input[data-drupal-selector="edit-attributes-target"]')
        .once('editor_advanced_linktargetrel')
        .change(function () {
          var rel_attribute_field = $('input[data-drupal-selector="edit-attributes-rel"]');
          var rel_attributes = ' ' + 'noopener';
          if (this.checked) {
            rel_attribute_field.val(rel_attribute_field.val() + rel_attributes);
            Drupal.announce(Drupal.t('the noopener attribute has been added to rel'));
          } else {
            rel_attribute_field.val(rel_attribute_field.val().replace(rel_attributes, ''));
            Drupal.announce(Drupal.t('the noopener attribute has been removed from rel'));
          }
        });
      }
    }
  };

}(Drupal, jQuery));
