<?php

/**
 * @file
 * Hooks provided by the maxlength module.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Define additional widget settings.
 *
 * @return array
 *   Additional widget settings.
 */
function hook_maxlength_widget_settings() {
  return [
    'text_textarea_custom_widget' => [
      'maxlength_setting' => TRUE,
      'summary_maxlength_setting' => TRUE,
      'truncate_setting' => TRUE,
    ],
  ];
}

/**
 * @} End of "addtogroup hooks".
 */
