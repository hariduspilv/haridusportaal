(function ($, Drupal) {

  'use strict';
  /* globals ec */
  Drupal.easychart = Drupal.easychart || {};
  Drupal.easychart.ecOptionsUI = $('<div id="easychart-options-ui" class="clearfix"></div>'); // wrapper div for the UI.
  Drupal.easychart.ecOptionsUI.newTabCount = 0; // Keep track of the amount of new tabs for the vertical tabs system.

  Drupal.behaviors.easychart = {
    attach: function (context, settings) {

      // Admin settings screen for options.
      if ($('.easychart-options').length > 0) {
        // Hide the textarea.
        var ecOptionsTextarea = $('.easychart-options');
        ecOptionsTextarea.parent().hide().after(Drupal.easychart.ecOptionsUI);

        // Get the default options from the Easychart library if necessary.
        if (ecOptionsTextarea.val() === '') {
          window.easychart = new ec($('#footer'));
          var options = JSON.stringify(window.easychart.getOptions(),null,4);
          ecOptionsTextarea.val(options);
          // If nothing changed, don't save the data.
          $("#easychart-admin-options-form").submit(function () {
            // Convert the config to the textarea.
            Drupal.easychart.UiToOptions(ecOptionsTextarea);

            if (options === ecOptionsTextarea.val()) {
              ecOptionsTextarea.val("");
            }
          });
        }
        // Save the updates to the options.
        else {
          $("#edit-submit").click(function () {
            Drupal.easychart.UiToOptions(ecOptionsTextarea);
          });
        }

        // Add a form instead of the textarea.
        var form = '<div class="ec-vertical-tabs-wrapper">';
        form += '  <ul class="ec-vertical-tabs">';
        form += '    <li class="ui-state-default visually-hidden ec-tab ec-tab-prototype"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span><input type="hidden" class="form-text ec-tab-key" value="" /><input type="text" placeholder="title" class="form-text ec-tab-title" value="" /></li>';
        form += '  </ul>';
        form += '  <div class="form-actions">';
        form += '    <a class="button ec-add-tab" href="#">' + Drupal.t('Add a vertical tab') + '</a>';
        form += '  </div>';
        form += '</div>';

        form += '<div class="ec-vertical-tabs-content-wrapper">';
        form += '  <div class="visually-hidden ec-tab-content ec-tab-content-prototype">';
        form += '  <ul class="ec-groups">';
        form += '    <li class="ui-state-default ec-group ec-group-prototype visually-hidden clearfix">';
        form += '      <div class="ec-group-content">';
        form += '        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span><input type="text" placeholder="title" class="form-text ec-group-title" value="" />';
        form += '        <ul class="ec-options">';
        form += '          <li class="ui-state-default visually-hidden ec-option ec-option-prototype"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span><input type="text" placeholder="key" class="form-text ec-option-key" /><input type="text" placeholder="title (optional)" class="form-text ec-option-title" /></li>';
        form += '        </ul>';
        form += '      </div>';
        form += '      <a class="ec-add-option" href="#">+ ' + Drupal.t('Add an option') + '</a>';
        form += '    </li>';
        form += '  </ul>';
        form += '  <a class="button ec-add-group" href="#">' + Drupal.t('Add a group') + '</a>';
        form += '</div>';
        form += '</div>';

        Drupal.easychart.ecOptionsUI.append(form);

        // Convert the existing options to form elements.
        Drupal.easychart.optionsToUi(ecOptionsTextarea);

        // Set the first tab as active.
        $('.ec-vertical-tabs .ec-tab', Drupal.easychart.ecOptionsUI).eq(1).addClass('active');
        $('.ec-vertical-tabs-content-wrapper .ec-tab-content', Drupal.easychart.ecOptionsUI).eq(1).removeClass('visually-hidden').addClass('active');

        // Make the different elements sortable.
        Drupal.easychart.makeSortable();

        // Create extra options on click
        $('.ec-add-option', Drupal.easychart.ecOptionsUI).click(function () {
          Drupal.easychart.destroySortable();
          Drupal.easychart.addOption('', '', $(this).parent('.ec-group'));
          Drupal.easychart.makeSortable();
          return false;
        });

        // Create extra groups on click
        $('.ec-add-group', Drupal.easychart.ecOptionsUI).click(function () {
          Drupal.easychart.destroySortable();
          Drupal.easychart.addGroup('', $(this).parent('.ec-tab-content'));
          Drupal.easychart.makeSortable();
          return false;
        });

        // Create extra tabs on click
        $('.ec-add-tab', Drupal.easychart.ecOptionsUI).click(function () {
          Drupal.easychart.destroySortable();

          Drupal.easychart.addTab('custom-tab-' + Drupal.easychart.ecOptionsUI.newTabCount, '');
          Drupal.easychart.ecOptionsUI.newTabCount++;
          Drupal.easychart.makeSortable();
          return false;
        });

        // Make the vertical tabs work.
        // Create extra tabs on click
        $('.ec-tab', Drupal.easychart.ecOptionsUI).click(function () {
          if (!$(this).hasClass('active')) {
            // Show the right tab content
            var tab = $(this).attr('class').replace('ui-state-default ec-tab ec-tab-', '');
            $('.ec-tab-content', Drupal.easychart.ecOptionsUI).addClass('visually-hidden').removeClass('active');
            $('.ec-tab-content-' + tab, Drupal.easychart.ecOptionsUI).removeClass('visually-hidden').addClass('active');

            // Toggle the active class.
            $('.ec-tab.active').removeClass('active');
            $(this).addClass('active');

            Drupal.easychart.destroySortable();
            Drupal.easychart.makeSortable();
          }

          return false;
        });

        // TODO: add 'remove' functionality.
      }

      // Admin settings screen for templates.
      if ($('.easychart-templates').length > 0) {
        var ecTemplatesTextarea = $('.easychart-templates');

        // Get the default options from the Easychart library if necessary.
        if (ecTemplatesTextarea.val() === '') {
          window.easychart = new ec($('#footer'));
          var templates = JSON.stringify(window.easychart.getTemplates(), null, 4);
          ecTemplatesTextarea.val(templates);
          // If nothing changed, don't save the data.
          $("#easychart-admin-templates-form").submit(function () {
            if (templates === ecTemplatesTextarea.val()) {
              ecTemplatesTextarea.val("");
            }
          });
        }
      }

    }
  };

  // Convert the options in a textarea to a configuration UI.
  Drupal.easychart.optionsToUi = function (textarea) {
    var ecOptionsConfig = JSON.parse(textarea.val());
    $(ecOptionsConfig).each(function () {
      // Add tabs.
      Drupal.easychart.addTab(this.id, this.panelTitle);
      var tab = this.id;
      $(this.panes).each(function () {
        // Add groups.
        var currentTab = $('.ec-tab-content-' + tab);
        Drupal.easychart.addGroup(this.title, currentTab);
        var group = Drupal.easychart.cleanTitle(this.title);
        $(this.options).each(function () {
          // Add options.
          var currentGroup = $('.ec-group-' + group, currentTab);
          Drupal.easychart.addOption(this.fullname, this.title, currentGroup);
        });
      });
    });
  };

  // Convert the options in a textarea to a configuration UI.
  Drupal.easychart.UiToOptions = function (textarea) {
    var options = [];

    // Get the tabs.
    var tabs = [];
    $('.ec-tab', Drupal.easychart.ecOptionsUI).not('.ec-tab-prototype').each(function () {
      var classes = $(this).attr('class');
      classes = classes.split(' ');
      var tabClass = classes[2].replace('ec-tab-', '');
      tabs.push(tabClass);
    });

    $(tabs).each(function () {
      var option = {};
      option.id = this;
      option.panelTitle = $('.ec-tab-' + option.id + ' .ec-tab-title', Drupal.easychart.ecOptionsUI).val();
      option.panes = [];
      $('#' + option.id + ' .ec-group').not('.ec-group-prototype').each(function () {
        var pane = {};
        pane.title = $('.ec-group-title', this).val();
        pane.options = [];
        $('.ec-option', this).not('.ec-option-prototype').each(function () {
          var option = {};
          option.fullname = $('.ec-option-key', this).val();
          option.title = $('.ec-option-title', this).val();
          pane.options.push(option);
        });

        option.panes.push(pane);
      });
      options.push(option);
    });
    textarea.val(JSON.stringify(options, null, '\t'));
  };

  // Add one tab.
  Drupal.easychart.addTab = function (id, title) {
    var newTab = $('.ec-tab-prototype', Drupal.easychart.ecOptionsUI).clone(true,true).appendTo('#easychart-options-ui ul.ec-vertical-tabs').removeClass('visually-hidden ec-tab-prototype').addClass('ec-tab-' + id);
    $('.ec-tab-id', newTab).val(id);
    $('.ec-tab-title', newTab).val(title);
    $('.ec-tab-content-prototype', Drupal.easychart.ecOptionsUI).clone(true, true).appendTo('#easychart-options-ui .ec-vertical-tabs-content-wrapper').removeClass('ec-tab-content-prototype').addClass('ec-tab-content-' + id).attr('id', id);
    $("input, select, textarea", Drupal.easychart.ecOptionsUI).bind('mousedown.ui-disableSelection selectstart.ui-disableSelection', function (e) {
      e.stopImmediatePropagation();
    });
    newTab.click();
  };

  // Add one group.
  Drupal.easychart.addGroup = function (title, tab) {
    var newGroup = $('.ec-group-prototype', tab).clone(true,true).appendTo($('.ec-groups', tab)).removeClass('visually-hidden ec-group-prototype').addClass('ec-group-' + Drupal.easychart.cleanTitle(title));
    $('.ec-group-title', newGroup).val(title);
  };

  // Add one option.
  Drupal.easychart.addOption = function (key, title, group) {
    // Clone the option prototype and add it in the right location.
    var newOption = $('.ec-option-prototype', group).clone(true,true).appendTo($('.ec-options', group)).removeClass('visually-hidden ec-option-prototype');
    $('.ec-option-key', newOption).val(key);
    $('.ec-option-title', newOption).val(title);
  };

  // Remove existing sortable behavior.
  Drupal.easychart.destroySortable = function () {
    // $('.ec-vertical-tabs, .ec-groups, .ec-options').sortable('destroy');
  };

  // Make alle elements sortable.
  Drupal.easychart.makeSortable = function () {

    // First the options
    var $options = $('.ec-tab-content.active .ec-options', Drupal.easychart.ecOptionsUI);
    if ($options.length > 0) {
      $options.sortable({
        'connectWith': '.ec-options'
      }).disableSelection();
      $("input", $options).bind('mousedown.ui-disableSelection selectstart.ui-disableSelection', function (e) {
        e.stopImmediatePropagation();
      });
    }

    // Then the groups and tabs. This order avoids a weird jQuery UI bug.
    $options = $('.ec-vertical-tabs, .ec-tab-content.active .ec-groups', Drupal.easychart.ecOptionsUI);
    if ($options.length > 0) {
      $options.sortable({
        'handle': '.ui-icon'
      }).disableSelection();
      $("input", $options).bind('mousedown.ui-disableSelection selectstart.ui-disableSelection', function (e) {
        e.stopImmediatePropagation();
      });
    }
  };

  // Return a clean version of a word.
  Drupal.easychart.cleanTitle = function (title) {
    return title.replace(/\s+/g, '-').toLowerCase();
  };

})(jQuery, Drupal);
