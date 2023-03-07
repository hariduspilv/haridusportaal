<?php

/**
 * @file
 * Contains \Drupal\hms_field\HMSServiceInterface.
 */

namespace Drupal\hms_field;

/**
 * Interface HMSServiceInterface.
 *
 * @package Drupal\hms_field
 */
interface HMSServiceInterface {


  /**
   * Get nested array values.
   *
   * @param array $array
   * @param array $parents
   * @param null $key_exists
   * @return mixed
   */
  public function array_get_nested_value(array &$array, array $parents, &$key_exists = NULL);

  /**
   * Returns possible format options.
   *
   * @return array
   */
  public function format_options();

  /**
   * Returns the factor map of the format options.
   *
   * Note: We cannot go further then weeks in this setup.
   *       A month implies that we know how many seconds a month is.
   *       Problem here is that a month can be 28(29), 30 or 31 days.
   *       Same goes for C (century) Y (year) Q (quarter).
   *       Only solution is that we have a value relative to a date.
   *
   *  Use HOOK_hms_factor_alter($factors) to do your own magic.
   *
   * @param boolean $return_full
   *
   * @return array
   */
  public function factor_map($return_full = FALSE);

  /**
   * Returns number of seconds from a formatted string.
   *
   * @param $str
   * @param string $format
   * @return mixed
   */
  public function formatted_to_seconds($str, $format = 'h:m:s');

  /**
   * Returns a formatted string form the number of seconds.
   *
   * @param $seconds
   * @param string $format
   * @param bool|TRUE $leading_zero
   * @return mixed
   */
  public function seconds_to_formatted($seconds, $format = 'h:mm', $leading_zero = TRUE);

  /**
   * Validate hms field input.
   *
   * @param integer $input
   * @param string $format
   *
   * @return boolean
   */
  public function isValid($input, $format);

  /**
   * Helper to normalize format.
   *
   * Changes double keys to single keys.
   *
   * @param $format
   * @return mixed
   */
  public function normalize_format($format);

  /**
   * Helper to extend values in search array
   *
   * @param $item
   * @return mixed
   */
  public function add_multi_search_tokens($item);

}
