(function ($, Drupal) {

/**
 * Enhancements to states.js.
 */

/**
 * Handle array values.
 * @see http://drupal.org/node/1149078
 */
Drupal.states.Dependent.comparisons['Array'] = function (reference, value) {
  // Make sure value is an array.
  if (!(typeof(value) === 'object' && (value instanceof Array))) {
    return false;
  }
  // We iterate through each value provided in the reference. If all of them
  // exist in value array, we return true. Otherwise return false.
  for (var key in reference) {
    if (reference.hasOwnProperty(key) && $.inArray(reference[key], value) < 0) {
      return false;
    }
  }
  return true;
};

// Checking if autocomplete is plugged in.
if (Drupal.autocomplete) {
  /**
   * Handles an autocompleteselect event.
   *
   * Override the autocomplete method to add a custom event.
   *
   * @param {jQuery.Event} event
   *   The event triggered.
   * @param {object} ui
   *   The jQuery UI settings object.
   *
   * @return {bool}
   *   Returns false to indicate the event status.
   */
  Drupal.autocomplete.options.select = function selectHandler(event, ui) {
    var terms = Drupal.autocomplete.splitValues(event.target.value);
    // Remove the current input.
    terms.pop();
    // Add the selected item.
    if (ui.item.value.search(',') > 0) {
      terms.push('"' + ui.item.value + '"');
    }
    else {
      terms.push(ui.item.value);
    }
    event.target.value = terms.join(', ');
    // Fire custom event that other controllers can listen to.
    jQuery(event.target).trigger('autocomplete-select');
    // Return false to tell jQuery UI that we've filled in the value already.
    return false;
  };
}

/**
 * New and existing states enhanced with configurable options.
 * Event names of states with effects have the following structure:
 * state:stateName-effectName.
 */

//Visible/Invisible.
$(document).bind('state:visible-fade', function(e) {
  if (e.trigger) {
    $(e.target).closest('.form-item, .form-submit, .form-wrapper')[e.value ? 'fadeIn' : 'fadeOut'](e.effect.speed);
  }
})
.bind('state:visible-slide', function(e) {
  if (e.trigger) {
    $(e.target).closest('.form-item, .form-submit, .form-wrapper')[e.value ? 'slideDown' : 'slideUp'](e.effect.speed);
  }
})
// Empty/Filled.
.bind('state:empty-empty', function(e) {
  if (e.trigger) {
    var field = $(e.target).find('input, select, textarea');
    if (e.effect.reset) {
      if (typeof oldValue == 'undefined' || field.val() !== e.effect.value) {
        oldValue = field.val();
      }
      field.val(e.value ? e.effect.value : oldValue);
    }
    else if (e.value) {
      field.val(e.effect.value);
    }
  }
})
.bind('state:empty-fill', function(e) {
  if (e.trigger) {
    var field = $(e.target).find('input, select, textarea');
    if (e.effect.reset) {
      if (typeof oldValue === 'undefined' || field.val() !== e.effect.value) {
        oldValue = field.val();
      }
      field.val(!e.value ? e.effect.value : oldValue);
    }
    else if (!e.value) {
      field.val(e.effect.value);
    }
  }
})
// Unchanged state. Do nothing.
.bind('state:unchanged', function() {});

Drupal.behaviors.conditionalFields = {
  attach: function (context, settings) {
    // AJAX is not updating settings.conditionalFields correctly.
    var conditionalFields = settings.conditionalFields || 'undefined';
    if (typeof conditionalFields === 'undefined' || typeof conditionalFields.effects === 'undefined') {
      return;
    }
    // Override state change handlers for dependents with special effects.
    var eventsData = $.hasOwnProperty('_data') ? $._data(document, 'events') : $(document).data('events');
    $.each(eventsData, function(i, events) {
      if (i.substring(0, 6) === 'state:') {
        var originalHandler = events[0].handler;
        events[0].handler = function(e) {
          var effect = conditionalFields.effects['#' + e.target.id];
          if (typeof effect !== 'undefined') {
            var effectEvent = i + '-' + effect.effect;
            if (typeof eventsData[effectEvent] !== 'undefined') {
              $(e.target).trigger({ type : effectEvent, trigger : e.trigger, value : e.value, effect : effect.options });
              return;
            }
          }
          originalHandler(e);
        }
      }
    });
  }
};

Drupal.behaviors.ckeditorTextareaFix = {
    attach: function(context, settings) {
        if(CKEDITOR) {
            CKEDITOR.on('instanceReady', function () {
                $(context).find('.form-textarea-wrapper textarea').each(function () {
                    var $textarea = jQuery(this);
                    if (CKEDITOR.instances[$textarea.attr('id')] != undefined) {
                        CKEDITOR.instances[$textarea.attr('id')].on('change', function () {
                            CKEDITOR.instances[$textarea.attr('id')].updateElement();
                            $textarea.trigger('keyup');
                        });
                    }
                });
            });
        }
    }
};

Drupal.behaviors.autocompleteChooseTrigger = {
    attach: function (context, settings) {
        $(context).find('.form-autocomplete').each(function () {
            var $input = $(this);
            $(this).on('autocomplete-select', function (event, node) {
                setTimeout(function () {
                    $input.trigger("keyup");
                }, 1);
            });
        });
    }
};

/**
 * Adds RegEx support
 * https://www.drupal.org/node/1340616
 */
Drupal.behaviors.statesModification = {
  weight: -10,
  attach: function (context, settings) {
    if (Drupal.states) {
      Drupal.states.Dependent.comparisons.Object = function (reference, value) {
        if ('regex' in reference) {
          return (new RegExp(reference.regex, reference.flags)).test(value);
        }
        else {
          return reference.indexOf(value) !== false;
        }
      }
    }
  }
};

})(jQuery, Drupal);
