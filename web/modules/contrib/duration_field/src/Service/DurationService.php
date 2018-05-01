<?php

namespace Drupal\duration_field\Service;

use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Provides services for the Duration Field module.
 */
class DurationService implements DurationServiceInterface {

  use StringTranslationTrait;

  const DURATION_FIELD_PATTERN = '/^P(\d+Y)?(\d+M)?(\d+D)?(T)?(\d+H)?(\d+M)?(\d+S)?$/';

  /**
   * {@inheritdoc}
   */
  public function checkDurationInvalid($duration) {

    if (!preg_match(self::DURATION_FIELD_PATTERN, $duration)) {
      return $this->t('%duration is not a valid duration', ['%duration' => $duration]);
    }

    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public static function convertValue(array $input) {

    $duration = '';

    $date_mappings = [
      'year' => 'Y',
      'month' => 'M',
      'day' => 'D',
    ];

    foreach ($date_mappings as $key => $duration_key) {
      if (isset($input[$key]) && $input[$key]) {
        $duration .= $input[$key] . $duration_key;
      }
    }

    $time_mappings = [
      'hour' => 'H',
      'minute' => 'M',
      'second' => 'S',
    ];

    $found = FALSE;
    foreach ($time_mappings as $key => $duration_key) {

      if (isset($input[$key]) && $input[$key]) {

        if (!$found) {
          $found = TRUE;
          $duration .= 'T';
        }
        $duration .= $input[$key] . $duration_key;
      }
    }

    return strlen($duration) ? 'P' . $duration : '';
  }

}
