<?php

namespace Drupal\taxonomy_manager;

use Drupal\Core\Language\LanguageInterface;

/**
 * Class for taxonomy manager helper.
 */
class TaxonomyManagerHelper {

  /**
   * Checks if voc has terms.
   *
   * @param int $vid
   *   The term ID.
   *
   * @return bool
   *   True, if terms already exists, else false
   */
  public static function vocabularyIsEmpty($vid) {
    /** @var \Drupal\taxonomy\TermStorageInterface $term_storage */
    $term_storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
    return empty($term_storage->loadTree($vid));
  }

  /**
   * Helper function for mass adding of terms.
   *
   * @param string $input
   *   The textual input with terms. Each line contains a single term. Child
   *   term can be prefixed with a dash '-' (one dash for each level). Term
   *   names starting with a dash and should not become a child term need
   *   to be wrapped in quotes.
   * @param int $vid
   *   The vocabulary id.
   * @param int $parents
   *   An array of parent term ids for the new inserted terms. Can be 0.
   * @param array $term_names_too_long
   *   Return value that is used to indicate that some term names were too long
   *   and truncated to 255 characters.
   *
   * @return array
   *   An array of the newly inserted term objects
   */
  public static function massAddTerms($input, $vid, $parents, array &$term_names_too_long = []) {
    $new_terms = [];
    $terms = explode("\n", str_replace("\r", '', $input));
    $parents = count($parents) ? $parents : 0;

    // Stores the current lineage of newly inserted terms.
    $last_parents = [];
    foreach ($terms as $name) {
      if (empty($name)) {
        continue;
      }
      $matches = [];
      // Child term prefixed with one or more dashes.
      if (preg_match('/^(-){1,}/', $name, $matches)) {
        $depth = strlen($matches[0]);
        $name = substr($name, $depth);
        $current_parents = isset($last_parents[$depth - 1]) ? [$last_parents[$depth - 1]->id()] : 0;
      }
      // Parent term containing dashes at the beginning and is therefore wrapped
      // in double quotes.
      elseif (preg_match('/^\"(-){1,}.*\"/', $name, $matches)) {
        $name = substr($name, 1, -1);
        $depth = 0;
        $current_parents = $parents;
      }
      else {
        $depth = 0;
        $current_parents = $parents;
      }
      // Truncate long string names that will cause database exceptions.
      if (strlen($name) > 255) {
        $term_names_too_long[] = $name;
        $name = substr($name, 0, 255);
      }

      $filter_formats = filter_formats();
      $format = array_pop($filter_formats);
      $values = [
        'name' => $name,
        // @todo do we need to set a format?
        'format' => $format->id(),
        'vid' => $vid,
        // @todo default language per vocabulary setting?
        'langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED,
      ];
      if (!empty($current_parents)) {
        foreach ($current_parents as $p) {
          $values['parent'][] = ['target_id' => $p];
        }

      }
      $term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->create($values);
      $term->save();
      $new_terms[] = $term;
      $last_parents[$depth] = $term;
    }
    return $new_terms;
  }

  /**
   * Helper function that deletes terms.
   *
   * Optionally orphans (terms where parent get deleted) can be deleted as well.
   *
   * Difference to core: deletion of orphans optional.
   *
   * @param array $tids
   *   Array of term ids to delete.
   * @param bool $delete_orphans
   *   If TRUE, orphans get deleted.
   */
  public static function deleteTerms(array $tids, $delete_orphans = FALSE) {
    $deleted_terms = [];
    $remaining_child_terms = [];

    while (count($tids) > 0) {
      $orphans = [];
      foreach ($tids as $tid) {
        $children = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadChildren($tid);
        if (!empty($children)) {
          foreach ($children as $child) {
            $parents = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadParents($child->id());
            if ($delete_orphans) {
              if (count($parents) == 1) {
                $orphans[$child->tid] = $child->id();
              }
              else {
                $remaining_child_terms[$child->id()] = $child->getName();
              }
            }
            else {
              $remaining_child_terms[$child->id()] = $child->getName();
              if ($parents) {
                // Parents structure see TermStorage::updateTermHierarchy.
                $parents_array = [];
                foreach ($parents as $parent) {
                  if ($parent->id() != $tid) {
                    $parent->target_id = $parent->id();
                    $parents_array[$parent->id()] = $parent;
                  }
                }
                if (empty($parents_array)) {
                  $parents_array = [0];
                }
                $child->parent = $parents_array;
                \Drupal::entityTypeManager()->getStorage('taxonomy_term')->deleteTermHierarchy([$child->id()]);
                \Drupal::entityTypeManager()->getStorage('taxonomy_term')->updateTermHierarchy($child);
              }
            }
          }
        }
        $term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($tid);
        if ($term) {
          $deleted_terms[] = $term->getName();
          $term->delete();
        }
      }
      $tids = $orphans;
    }
    return ['deleted_terms' => $deleted_terms, 'remaining_child_terms' => $remaining_child_terms];
  }

}
