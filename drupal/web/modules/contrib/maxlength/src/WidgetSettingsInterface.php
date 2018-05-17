<?php

namespace Drupal\maxlength;

/**
 * The WidgetManagerInterface interface definition.
 */
interface WidgetSettingsInterface {

  /**
   * Returns which settings are allowed for a widget.
   *
   * @param string $widget_plugin_id
   *   The plugin id of a widget.
   *
   * @return array()
   *   An array with all the settings which are allowed for a plugin id.
   */
  public function getAllowedSettings($widget_plugin_id);

  /**
   * Returns all the settings which are allowed for all the widgets.
   */
  public function getAllowedSettingsForAll();

}
