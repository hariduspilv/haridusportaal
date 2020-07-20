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
      'key_value_textarea' => array(
        'maxlength_setting' => TRUE,
        'summary_maxlength_setting' => TRUE,
        'truncate_setting' => TRUE,
      ),
      'link_default' => array(
        'maxlength_setting' => TRUE,
        'summary_maxlength_setting' => FALSE,
        'truncate_setting' => FALSE,
      ),
      'linkit' => array(
        'maxlength_setting' => TRUE,
        'summary_maxlength_setting' => FALSE,
        'truncate_setting' => FALSE,
      ),
    );

    $additional_widget_settings = \Drupal::moduleHandler()->invokeAll('maxlength_widget_settings') ?: [];

    return $settings + $additional_widget_settings;
  }

  /**
   * {@inheritdoc}
   *
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
