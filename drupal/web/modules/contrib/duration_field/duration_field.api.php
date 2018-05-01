<?php

/**
 * @file
 * Contains hook examples for the Duration Field module.
 */

/**
 * Add custom field separators to be used by the Duration Field module.
 *
 * Note that if this hook is implemented, hook_duration_field_labels() is also
 * required to be implemented.
 *
 * @return array
 *   An array of separators to be used between time values when displaying the
 *   duration value. Keys should be the machine name of the separator, with
 *   values being the actual separator that should be used. Note that keys are
 *   arbitrary, but need to be the same as the machine name keys used in
 *   hook_duration_field_labels().
 */
function hook_duration_field_separators() {
  return [
    'asterisks' => '***',
    'hashes' => '###',
  ];
}

/**
 * Add custom field separators to be used by the Duration Field module.
 *
 * Note that if this hook is implemented, hook_duration_field_separators() is
 * also required to be implemented.
 *
 * @return array
 *   An array with two keys, 'capitalized' and 'lowercase'. Each element of this
 *   array should be an array, whose keys are the machine names specified in
 *   hook_duration_field_separators() with the value being the translated name
 *   of the separator. This means that each machine name will exist in both the
 *   'capitalized' and the 'lowercase' elements of the return array.
 */
function hook_duration_field_labels() {
  return [
    'capitalized' => [
      'asterisks' => t('Asterisks'),
      'hashes' => t('Hashes'),
    ],
    'lowercase' => [
      'asterisks' => t('asterisks'),
      'hashes' => t('hashes'),
    ],
  ];
}
