/**
 * @file
 * Overrides media_library.view.js checkbox construction.
 *
 * @todo Remove after https://www.drupal.org/node/3024975 is in.
 */

(($, Drupal) => {
  Drupal.behaviors = Drupal.behaviors || {};

  /**
   * Adds checkbox to select all items in the library.
   *
   * @see media_library.view.es6.js
   */
  Drupal.behaviors.MediaLibrarySelectAll = {
    attach(context) {
      const $view = $('.media-library-view', context).once('media-library-select-all');
      if ($view.length && $view.find('.media-library-item').length) {
        const $checkbox = $(Drupal.theme('checkbox')).on(
          'click',
          ({ currentTarget }) => {
            // Toggle all checkboxes.
            const $checkboxes = $(currentTarget)
              .closest('.media-library-view')
              .find('.media-library-item input[type="checkbox"]');
            $checkboxes
              .prop('checked', $(currentTarget).prop('checked'))
              .trigger('change');
            // Announce the selection.
            const announcement = $(currentTarget).prop('checked')
              ? Drupal.t('Zero items selected')
              : Drupal.t('All @count items selected', {
                '@count': $checkboxes.length,
              });
            Drupal.announce(announcement);
          },
        );
        const $label = $('<label class="media-library-select-all"></label>').text(Drupal.t('Select all media'));
        $label.prepend($checkbox);
        $view
          .find('.media-library-item')
          .first()
          .before($label);
      }
    },
  };
})(jQuery, Drupal);
