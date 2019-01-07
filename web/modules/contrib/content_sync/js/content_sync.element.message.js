/**
 * @file
 * JavaScript behaviors for message element integration.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Behavior for handler message close.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.content_syncMessageClose = {
    attach: function (context) {
      $(context).find('.js-content_sync-message--close').once('content_sync-message--close').each(function () {
        var $element = $(this);

        var id = $element.attr('data-message-id');
        var storage = $element.attr('data-message-storage');
        var effect = $element.attr('data-message-close-effect') || 'hide';
        switch (effect) {
          case 'slide': effect = 'slideUp'; break;

          case 'fade': effect = 'fadeOut'; break;
        }

        // Check storage status.
        if (isClosed($element, storage, id)) {
          return;
        }

        $element.show().find('.js-content_sync-message__link').on('click', function (event) {
          $element[effect]();
          setClosed($element, storage, id);
          $element.trigger('close');
          event.preventDefault();
        });
      });
    }
  };

  function isClosed($element, storage, id) {
    if (!id || !storage) {
      return false;
    }

    switch (storage) {
      case 'local':
        if (window.localStorage) {
          return localStorage.getItem('Drupal.content_sync.message.' + id) || false;
        }
        return false;

      case 'session':
        if (window.sessionStorage) {
          return sessionStorage.getItem('Drupal.content_sync.message.' + id) || false;
        }
        return false;

      default:
        return false;
    }
  }

  function setClosed($element, storage, id) {
    if (!id || !storage) {
      return;
    }

    switch (storage) {
      case 'local':
        if (window.localStorage) {
          localStorage.setItem('Drupal.content_sync.message.' + id, true);
        }
        break;

      case 'session':
        if (window.sessionStorage) {
          sessionStorage.setItem('Drupal.content_sync.message.' + id, true);
        }
        break;

      case 'user':
      case 'state':
        $.get($element.find('.js-content_sync-message__link').attr('href'));
        return true;
    }
  }

})(jQuery, Drupal);
