<?php

namespace Drupal\duration_field\Service;

/**
 * Interface for classes providing services for the Duration Field module.
 */
interface DurationServiceInterface {

  /**
   * Checks if a given duration is a valid Iso8601 duration format.
   *
   * @input string $duration
   *   The string whose format should be checked
   *
   * @return bool
   *   - TRUE if the string is a valid format
   *   - FALSE if it's an invalid format
   *
   * @see http://en.wikipedia.org/wiki/Iso8601#Durations
   */
  public function checkDurationInvalid($duration);

  /**
   * Convert array into PHP duration format.
   *
   * @param array $input
   *   An array containing any of the following keys:
   *   - year
   *   - month
   *   - day
   *   - hour
   *   - minute
   *   - second.
   *
   * @return string
   *   A string in Iso 8601 duration format
   *
   * @see http://en.wikipedia.org/wiki/Iso8601#Durations
   */
  public static function convertValue(array $input);

}
