/**
 * @file
 * Provide client side functionality for running fields.
 */

(function ($) {

var unixtimestamp = function() {
  return Math.floor((new Date()).getTime() / 1000);
};

var hms_seconds_to_formatted = function(seconds, format, leading_zero) {
  var leading_zero = typeof leading_zero !== 'undefined' ? leading_zero : true;
  var text = '';
  var values = new Array;
  var left_over = parseInt(seconds);

  if (seconds < 0) {
    text += '-';
    left_over = Math.abs(left_over);
  }

  for(key in drupalSettings.hms_field.factor_map) {
    if (left_over == 0) {
      values[key] = 0;
      continue;
    }
    values[key] = Math.floor(left_over / parseInt(drupalSettings.hms_field.factor_map[key]));
    left_over = left_over - parseInt(values[key] * parseInt(drupalSettings.hms_field.factor_map[key]));
  }
  format = format.split(':');
  for(letter in format) {
    var key = format[letter].substr(0, 1);

    if (!leading_zero && !values[key]) {
      continue;
    }
    leading_zero = true;

    var value = values[key].toString();
    var numzeros = parseInt(format[letter].length) - parseInt(value.length);

    if (numzeros > 0) {
      for(var i=0;i<numzeros;i++) {
        text += '0';
      }
    }
    text += value + ':';
  }
  if (text.length == 0) {
    var numzeros = format.pop().length;
    for(var i=0;i<numzeros;i++) {
      text += '0';
    }
    text += ':';
  }
  return text.substr(0, text.length -1);
};

var hms_update_field = function(element) {

  var leading_zero = true;
  var format = 'h:mm';
  var offset = 0;
  var since = drupalSettings.hms_field.servertime;
  var current = unixtimestamp() + hms_tick_difference;
  var seconds = 0;

  $($(element).attr('class').split(' ')).each(function() {
    var regexp = /^hms\-([a-z_]*)\-(.*)$/gi;
    var match = regexp.exec(this);
    if (match) {
      switch (match[1]) {
        case 'format':
          format = match[2].replace(/\-/g, ':');
          break;
        case 'offset':
          offset = parseInt(match[2]);
          break;
        case 'since':
          since = parseInt(match[2]);
          break;
        case 'leading_zero':
          leading_zero = parseInt(match[2])?true:false;
          break;
      }
    }
  });

  seconds = offset + current - since;
  text = hms_seconds_to_formatted(seconds, format, leading_zero);
  if (text != $(element).text()) {
    $(element).text(text);
  }
};

var hms_tick_difference = 0;
var hms_timer = null;
var hms_request_time = unixtimestamp();
var hms_tick_difference_done = false;


Drupal.behaviors.hmsfield = {
  attach: function (context, settings) {
    if (!hms_tick_difference_done) {
      // Calculate the difference between server time and client time.
      hms_tick_difference = settings.hms_field.servertime - hms_request_time;
      hms_tick_difference_done = true;
    }

    // We search in the whole DOM object, not only in our context
    if ($('.hms-running').length && !hms_timer) {
      hms_timer = window.setInterval(function() {
        $('.hms-running').each(function() {
          hms_update_field(this);
        });
      }, 1000);
    } else if (!$('.hms-running').length && hms_timer) {
      window.clearInterval(hms_timer);
      hms_timer = null;
    }

  },

  detach: function (context, settings) {
    if (hms_timer) {
      window.clearInterval(hms_timer);
      hms_timer = null;
    }
  }
};

})(jQuery);
