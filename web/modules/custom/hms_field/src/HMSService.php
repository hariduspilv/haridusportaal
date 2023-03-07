<?php

/**
 * @file
 * Contains \Drupal\hms_field\HMSService.
 */

namespace Drupal\hms_field;


/**
 * Provides a service to handle various hms related functionality.
 *
 * @package Drupal\hms_field
 */
class HMSService implements HMSServiceInterface {

  /**
   * {@inheritdoc}
   */
  public function add_multi_search_tokens($item) {
    return '/' . $item . '+/';
  }

  /**
   * {@inheritdoc}
   */
  public function array_get_nested_value(array &$array, array $parents, &$key_exists = NULL) {
    $ref = &$array;
    foreach ($parents as $parent) {
      if (is_array($ref) && array_key_exists($parent, $ref)) {
        $ref = &$ref[$parent];
      }
      else {
        $key_exists = FALSE;
        $null = NULL;
        return $null;
      }
    }
    $key_exists = TRUE;
    return $ref;
  }

  /**
   * {@inheritdoc}
   */
  public function factor_map($return_full = FALSE) {
    $factor = drupal_static(__FUNCTION__);
    if (empty($factor)) {
      $factor = array(
        'w' => array(
          'factor value' => 604800,
          'label single' => 'week',
          'label multiple' => 'weeks'
        ),
        'd' => array(
          'factor value' => 86400,
          'label single' => 'day',
          'label multiple' => 'days'
        ),
        'h' => array(
          'factor value' => 3600,
          'label single' => 'hour',
          'label multiple' => 'hours'
        ),
        'm' => array(
          'factor value' => 60,
          'label single' => 'minute',
          'label multiple' => 'minutes'
        ),
        's' => array(
          'factor value' => 1,
          'label single' => 'second',
          'label multiple' => 'seconds'
        ),
      );
      \Drupal::moduleHandler()->alter('hms_factor', $factor);
    }

    if ($return_full) {
      return $factor;
    }

    // We only return the factor value here.
    // for historical reasons we also check if value is an array.
    $return = array();
    foreach ($factor as $key => $val) {
      $value = (is_array($val) ? $val['factor value'] : $val);
      $return[$key] = $value;
    }
    return $return;
  }

  /**
   * {@inheritdoc}
   */
  public function format_options() {
    $format = drupal_static(__FUNCTION__);
    if (empty($format)) {
      $format = array(
        'h:mm' => 'h:mm',
        'hh:mm:ss' => 'hh:mm:ss',
        'h:mm:ss' => 'h:mm:ss',
        'm:ss' => 'm:ss',
        'h' => 'h',
        'm' => 'm',
        's' => 's'
      );
      \Drupal::moduleHandler()->alter('hms_format', $format);
    }
    return $format;
  }

  /**
   * {@inheritdoc}
   */
  public function formatted_to_seconds($str, $format = 'h:m:s') {
    if (!strlen($str)) {
      return NULL;
    }

    if ($str == '0') {
      return 0;
    }

    $value = 0;

    // is the value negative?
    $negative = FALSE;
    if (substr($str, 0, 1) == '-') {
      $negative = TRUE;
      $str = substr($str, 1);
    }

    $factor_map = $this->factor_map();
    $search = $this->normalize_format($format);

    for ($i = 0; $i < strlen($search); $i++) {
      // Is this char in the factor map?
      if (isset($factor_map[$search[$i]])) {
        $factor = $factor_map[$search[$i]];
        // What is the next seperator to search for?
        $bumper = '$';
        if (isset($search[$i + 1])) {
          $bumper = '(' . preg_quote($search[$i + 1], '/') . '|$)';
        }
        if (preg_match_all('/^(.*)' . $bumper . '/U', $str, $matches)) {
          // Replace , with .
          $num = str_replace(',', '.', $matches[1][0]);
          // Return error when found string is not numeric
          if (!is_numeric($num)) {
            return FALSE;
          }
          // Shorten $str
          $str = substr($str, strlen($matches[1][0]));
          // Calculate value
          $value += ($num * $factor);
        }

      }
      elseif (substr($str, 0, 1) == $search[$i]) {
        // Expected this value, cut off and go ahead.
        $str = substr($str, 1);
      }
      else {
        // Does not follow format.
        return FALSE;
      }
      if (!strlen($str)) {
        // No more $str to investigate.
        break;
      }
    }

    if ($negative) {
      $value = 0 - $value;
    }
    return $value;
  }

  /**
   * {@inheritdoc}
   */
  public function normalize_format($format) {
    $keys = array_keys($this->factor_map());
    $search_keys = array_map(array($this, 'add_multi_search_tokens'), $keys);
    return preg_replace($search_keys, $keys, $format);
  }

  /**
   * {@inheritdoc}
   */
  public function seconds_to_formatted($seconds, $format = 'h:mm', $leading_zero = TRUE) {

    // Return NULL on empty string.
    if ($seconds === '' || is_null($seconds)) {
      return NULL;
    }

    $factor = $this->factor_map();
    // We need factors, biggest first.
    arsort($factor, SORT_NUMERIC);
    $values = array();
    $left_over = $seconds;
    $str = '';
    if ($seconds < 0) {
      $str .= '-';
      $left_over = abs($left_over);
    }
    foreach ($factor as $key => $val) {
      if (strpos($format, $key) === FALSE) {
        continue; // Not in our format, please go on, so we can plus this on a value in our format.
      }
      if ($left_over == 0) {
        $values[$key] = 0;
        continue;
      }
      $values[$key] = floor($left_over / $factor[$key]);
      $left_over -= ($values[$key] * $factor[$key]);
    }

    $format = explode(':', $format);

    foreach ($format as $key) {
      if (!$leading_zero && (empty($values[substr($key, 0, 1)]) || !$values[substr($key, 0, 1)])) {
        continue;
      }
      $leading_zero = TRUE;
      $str .= sprintf('%0' . strlen($key) . 'd', $values[substr($key, 0, 1)]) . ':';
    }
    if (!strlen($str)) {
      $key = array_pop($format);
      $str = sprintf('%0' . strlen($key) . 'd', 0) . ':';
    }
    return substr($str, 0, -1);
  }

  /**
   * {@inheritdoc}
   */
  public function isValid($input, $format) {
    if ($this->formatted_to_seconds($input, $format) !== FALSE) {
      return TRUE;
    }
    return FALSE;
  }
}
