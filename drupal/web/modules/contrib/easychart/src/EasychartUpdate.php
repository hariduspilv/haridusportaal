<?php

/**
 * @file
 * Contains \Drupal\easychart\EasychartUpdate
 */

namespace Drupal\easychart;

class EasychartUpdate {

  /**
   *  Update the csv data from the url stored in the database.
   */
  public static function updateCSVFromUrl() {

    $field_storages = \Drupal::entityTypeManager()
      ->getStorage('field_storage_config')
      ->loadByProperties(array('type' => 'easychart'));

    /* @var $field_storage \Drupal\field\FieldStorageConfigInterface */
    foreach ($field_storages as $field_storage) {

      $field_name = $field_storage->getName();
      $entity_type = $field_storage->getTargetEntityTypeId();
      $ids = \Drupal::entityQuery($entity_type)
        ->condition($field_name . '.csv_url', "", "!=")
        ->execute();

      if (!empty($ids)) {
        $entities = \Drupal::entityTypeManager()
          ->getStorage($entity_type)
          ->loadMultiple($ids);

        /* @var $entity \Drupal\Core\Entity\EntityInterface */
        foreach ($entities as $entity) {
          $url = $entity->{$field_name}->csv_url;
          $csv_data = file_get_contents($url);
          if (!empty($csv_data)) {
            $delimiter = static::findCSVDelimiter($csv_data);
            $csv = json_encode(static::parseCSV($csv_data, $delimiter));
            $entity->{$field_name}->csv = $csv;
            $entity->save();
          }
        }
      }
    }
  }

  /**
   * Helper function to parse the csv data into an array.
   *
   * @param $csv_string
   *   The CSV.
   * @param string $delimiter
   *   The delimiter.
   * @param bool $skip_empty_lines
   *   Whether to skip empty lines or not
   * @param bool $trim_fields
   *   Whether to trim fields or not.
   *
   * @return array
   */
  private static function parseCSV($csv_string, $delimiter = ",", $skip_empty_lines = true, $trim_fields = true) {
    $enc = preg_replace('/(?<!")""/', '!!Q!!', $csv_string);
    $enc = preg_replace_callback(
      '/"(.*?)"/s',
      function ($field) {
        return urlencode(utf8_encode($field[1]));
      },
      $enc
    );
    $lines = preg_split($skip_empty_lines ? ($trim_fields ? '/( *\R)+/s' : '/\R+/s') : '/\R/s', $enc);
    return array_map(
      function ($line) use ($delimiter, $trim_fields) {
        $fields = $trim_fields ? array_map('trim', explode($delimiter, $line)) : explode($delimiter, $line);
        return array_map(
          function ($field) {
            return str_replace('!!Q!!', '"', utf8_decode(urldecode($field)));
          },
          $fields
        );
      },
      $lines
    );
  }

  /**
   * Helper function to find the delimiter in a csv file.
   *
   * @param string $data
   *   A collection of data.
   *
   * @return string $delimiter.
   *   The delimiter.
   */
  private static function findCSVDelimiter($data) {

    // Possible delimiters.
    $delimiters = array(
      'tab'       => "\t",
      'comma'     => ",",
      'semicolon' => ";"
    );

    // Count how much a possible delimiter appears.
    $delimiters_found = array();
    foreach ($delimiters as $key => $value ){
      $delimiters_found[$key] = count(explode($value, $data)) - 1;
    }

    // Get the highest appearance score.
    arsort($delimiters_found);
    reset($delimiters_found);
    $delimiter = key($delimiters_found);

    return $delimiters[$delimiter];
  }
}
