<?php

namespace Drupal\config_merge;

use Symfony\Component\Yaml\Inline;

/**
 * Provides helper functions for merging configuration items.
 */
class ConfigMerger {

  /**
   * Merges changes to a configuration item into the active storage.
   *
   * @param $previous
   *   The configuration item as previously provided (from snapshot).
   * @param $current
   *   The configuration item as currently provided by an extension.
   * @param $active
   *   The configuration item as present in the active storage.
   */
  public static function mergeConfigItemStates(array $previous, array $current, array $active) {
    // We are merging into the active configuration state.
    $result = $active;

    $states = [
      $previous,
      $current,
      $active,
    ];

    $is_associative = FALSE;

    foreach ($states as $array) {
      // Analyze the array to determine if we should preserve integer keys.
      if (Inline::isHash($array)) {
        // If any of the states is associative, treat the item as associative.
        $is_associative = TRUE;
        break;
      }
    }

    // Process associative arrays.
    // Find any differences between previous and current states.
    if ($is_associative) {
      // Detect and process removals.
      $removed = array_diff_key($previous, $current);
      foreach ($removed as $key => $value) {
        // Remove only if unchanged in the active state.
        if (isset($active[$key]) && $active[$key] === $previous[$key]) {
          unset($result[$key]);
        }
      }

      // Detect and handle additions.
      // Additions are keys added since the previous state and not overridden
      // in the active state.
      $added = array_diff_key($current, $previous, $active);
      // Merge in all current keys while retaining the key order.
      $merged = array_replace($current, $result);
      // Filter to keep array items from the merged set that ...
      $result = array_intersect_key(
        // have keys that are either ...
        $merged, array_flip(
          array_merge(
            // in the original result set or ...
            array_keys($result),
            // should be added.
            array_keys($added)
          )
        )
      );

      // Detect and process changes.
      foreach ($current as $key => $value) {
        if (isset($previous[$key]) && $previous[$key] !== $value) {
          // If we have an array, recurse.
          if (is_array($value) && is_array($previous[$key]) && isset($active[$key]) && is_array($active[$key])) {
            $result[$key] = self::mergeConfigItemStates($previous[$key], $value, $active[$key]);
          }
          else {
            // Accept the new value only if the item hasn't been customized.
            if (isset($active[$key]) && $active[$key] === $previous[$key]) {
              $result[$key] = $value;
            }
          }
        }
      }
    }
    // Process indexed arrays. Here we can't reliably distinguish between an
    // array value that's been changed and one that is new. Therefore, rather
    // than merging array values, we return either the active or the current
    // (new) state.
    else {
      // If the data is unchanged, use the current value. Otherwise, retain any
      // customization by keeping with the active value set above.
      if ($previous === $active) {
        $result = $current;
      }
    }

    return $result;
  }

}
