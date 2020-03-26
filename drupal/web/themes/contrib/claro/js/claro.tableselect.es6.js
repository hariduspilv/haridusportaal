/**
 * @file
 * Overrides tableselect.js checkbox construction.
 *
 * @todo Remove after https://www.drupal.org/node/3024975 is in.
 */

(($, Drupal) => {
  /**
   * Replacement callback used in Drupal.behaviors.tableSelect.
   *
   * @param {Integer} index
   *   The element index.
   * @param {HTMLElement} value
   *   The table element.
   *
   * @see tableselect.es6.js
   */
  Drupal.tableSelect = (index, value) => {
    // Do not add a "Select all" checkbox if there are no rows with checkboxes
    // in the table.
    if ($(value).find('td input[type="checkbox"]').length === 0) {
      return;
    }

    // Keep track of the table, which checkbox is checked and alias the
    // settings.
    const table = value;
    let checkboxes;
    let lastChecked;
    const $table = $(table);
    const strings = {
      selectAll: Drupal.t('Select all rows in this table'),
      selectNone: Drupal.t('Deselect all rows in this table'),
    };
    const updateSelectAll = (state) => {
      // Update table's select-all checkbox (and sticky header's if available).
      $table
        .prev('table.sticky-header')
        .addBack()
        .find('th.select-all input[type="checkbox"]')
        .each((i, element) => {
          const $checkbox = $(element);
          const stateChanged = $checkbox.prop('checked') !== state;

          $checkbox.attr(
            'title',
            state ? strings.selectNone : strings.selectAll,
          );

          /**
           * @checkbox {HTMLElement}
           */
          if (stateChanged) {
            $checkbox.prop('checked', state).trigger('change');
          }
        });
    };

    // Find all <th> with class select-all, and insert the check all checkbox.
    $table
      .find('th.select-all')
      .prepend($(Drupal.theme('checkbox')).attr('title', strings.selectAll))
      .on('click', (event) => {
        if ($(event.target).is('input[type="checkbox"]')) {
          // Loop through all checkboxes and set their state to the select all
          // checkbox' state.
          checkboxes.each((i, element) => {
            const $checkbox = $(element);
            const stateChanged = $checkbox.prop('checked') !== event.target.checked;

            /**
             * @checkbox {HTMLElement}
             */
            if (stateChanged) {
              $checkbox.prop('checked', event.target.checked).trigger('change');
            }
            // Either add or remove the selected class based on the state of the
            // check all checkbox.

            /**
             * @checkbox {HTMLElement}
             */
            $checkbox.closest('tr').toggleClass('selected', event.target.checked);
          });
          // Update the title and the state of the check all box.
          updateSelectAll(event.target.checked);
        }
      });

    // For each of the checkboxes within the table that are not disabled.
    checkboxes = $table
      .find('td input[type="checkbox"]:enabled')
      .on('click', (e) => {
        // Either add or remove the selected class based on the state of the
        // check all checkbox.

        /**
         * @e.target {HTMLElement}
         */
        $(e.target)
          .closest('tr')
          .toggleClass('selected', e.target.checked);

        // If this is a shift click, we need to highlight everything in the
        // range. Also make sure that we are actually checking checkboxes
        // over a range and that a checkbox has been checked or unchecked before.
        if (e.shiftKey && lastChecked && lastChecked !== e.target) {
          // We use the checkbox's parent <tr> to do our range searching.
          Drupal.tableSelectRange(
            $(e.target).closest('tr')[0],
            $(lastChecked).closest('tr')[0],
            e.target.checked,
          );
        }

        // If all checkboxes are checked, make sure the select-all one is checked
        // too, otherwise keep unchecked.
        updateSelectAll(checkboxes.length === checkboxes.filter(':checked').length);

        // Keep track of the last checked checkbox.
        lastChecked = e.target;
      });

    // If all checkboxes are checked on page load, make sure the select-all one
    // is checked too, otherwise keep unchecked.
    updateSelectAll(checkboxes.length === checkboxes.filter(':checked').length);
  };
})(jQuery, Drupal);
