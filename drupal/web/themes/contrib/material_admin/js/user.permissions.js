/**
 * @file
 * User permission page behaviors.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Shows checked and disabled checkboxes for inherited permissions.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches functionality to the permissions table.
   */
  Drupal.behaviors.permissions = {
    attach: function (context) {
      var self = this;
      $('table#permissions').once('permissions').each(function () {
        // On a site with many roles and permissions, this behavior initially
        // has to perform thousands of DOM manipulations to inject checkboxes
        // and hide them. By detaching the table from the DOM, all operations
        // can be performed without triggering internal layout and re-rendering
        // processes in the browser.
        var $table = $(this);
        var $ancestor;
        var method;
        if ($table.prev().length) {
          $ancestor = $table.prev();
          method = 'after';
        }
        else {
          $ancestor = $table.parent();
          method = 'append';
        }
        $table.detach();

        // Initialize the authenticated user checkbox.
        $table.find('input[type=checkbox].js-rid-authenticated')
          .on('click.permissions', self.toggle)
          // .triggerHandler() cannot be used here, as it only affects the first
          // element.
          .each(self.toggle)

        // Re-insert the table into the DOM.
        $ancestor[method]($table);
      });
    },

    /**
     * Toggles all dummy checkboxes based on the checkboxes' state.
     *
     * If the "authenticated user" checkbox is checked, the checked and disabled
     * checkboxes are shown, the real checkboxes otherwise.
     */
    toggle: function () {
      var authCheckbox = this;
      var $row = $(this).closest('tr');
      // jQuery performs too many layout calculations for .hide() and .show(),
      // leading to a major page rendering lag on sites with many roles and
      // permissions. Therefore, we toggle visibility directly.
      $row.find('.js-real-checkbox').each(function () {
        this.style.display = (authCheckbox.checked ? 'none' : '');
        if (authCheckbox.checked) {
          $(this).siblings('label').css('display','none');
        } else {
          $(this).siblings('label').css('display','');
        }
      });
      $row.find('.js-dummy-checkbox').each(function () {
        this.style.display = (authCheckbox.checked ? '' : 'none');
      });
    }
  };

})(jQuery, Drupal);
