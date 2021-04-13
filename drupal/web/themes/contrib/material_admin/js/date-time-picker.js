/**
 * @file
 * Date And Time Picker
 *
 */

(function ($, Drupal, M) {

  Drupal.behaviors.material_datepicker = {
    attach: function (context, settings) {
      var selectYears = drupalSettings.material_admin.material_admin_datepicker_select_years;
      var options = {
        format: 'yyyy-mm-dd',
        autoClose: true,
        yearRange: parseInt(selectYears),
        showClearBtn: true
      };
      // Initialize datepicker using the M.Datepicker method rather than the
      // $('selector').datepicker method to give us more control over datepicker
      // instances and to avoid possible conflict with jQuery datepicker.
      var date_inputs = document.querySelectorAll('.form-date:not(.datepicker-initialized)');
      M.Datepicker.init(date_inputs, options);
      // Ensure that each datepicker is only initialized once.
      $(date_inputs).addClass('datepicker-initialized');
      // If the date input already has a value when the form is loaded, the
      // datepicker won't pick it up by default. Do some extra work to parse
      // existing date values and apply them to the corresponding datepickers.
      $(date_inputs).each(function() {
        var $date_input = $(this);
        var initial_date = $date_input.val().split('-');
        if (initial_date.length > 0) {
          var instance = M.Datepicker.getInstance($date_input);
          instance.setDate(new Date(parseInt(initial_date[0]), parseInt(initial_date[1]) - 1, parseInt(initial_date[2])));
        }
      });
    }
  };

  Drupal.behaviors.material_timepicker = {
    attach: function (context) {
      var $time_inputs = $('.form-time:not(.timepicker-initialized)');
      $time_inputs.each(function() {
        var $this = $(this);
        M.Timepicker.init($this, {
          autoClose: true,
          showClearBtn: true,
          twelveHour: false
          // The new MaterializeCSS timepicker does not allow an output format
          // to be specified when using 12-hour mode; therefore, the timepicker
          // does not work with time inputs in browsers such as Chrome, because
          // times in the default format (e.g. "12:30 AM") are rejected by
          // internal browser validation.
          // Enable the following lines after custom format support is added to
          // MaterializeCSS.
          // @see https://github.com/Dogfalo/materialize/pull/6368.
          // twelveHour: true,
          // format: 'HH:mm'
        });
        // Ensure that each timepicker is only initialized once.
        $this.addClass('timepicker-initialized');
      });
    }
  };

}(jQuery, Drupal, M));
