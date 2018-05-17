<?php

namespace Drupal\maxlength;

/**
 * The WidgetManager service.
 */
class WidgetSettings implements WidgetSettingsInterface {

  /**
   * {@inheritdoc}
   */
  public function getAllowedSettingsForAll() {
    // @todo: find a more flexible way to specify these settings, not hardcoded
    // here.
    $settings = array(
      'string_textfield' => array(
        'maxlength_setting' => TRUE,
        'summary_maxlength_setting' => FALSE,
        'truncate_setting' => FALSE,
      ),
      'string_textarea' => array(
        'maxlength_setting' => TRUE,
        'summary_maxlength_setting' => FALSE,
        'truncate_setting' => TRUE,
      ),
      'text_textfield' => array(
        'maxlength_setting' => TRUE,
        'summary_maxlength_setting' => FALSE,
        'truncate_setting' => FALSE,
      ),
      'text_textarea' => array(
        'maxlength_setting' => TRUE,
        'summary_maxlength_setting' => FALSE,
        'truncate_setting' => TRUE,
      ),
      'text_textarea_with_summary' => array(
        'maxlength_setting' => TRUE,
        'summary_maxlength_setting' => TRUE,
        'truncate_setting' => TRUE,
      ),
    );
    return $settings;
  }

  /**
   * {@inheritdoc}
   * @see \Drupal\maxlength\WidgetSettingsInterface::getAllowedSettings()
   */
  public function getAllowedSettings($widget_plugin_id) {
    $all_settings = $this->getAllowedSettingsForAll();
    if (!empty($all_settings[$widget_plugin_id])) {
      return $all_settings[$widget_plugin_id];
    }
    return array();
  }

}
