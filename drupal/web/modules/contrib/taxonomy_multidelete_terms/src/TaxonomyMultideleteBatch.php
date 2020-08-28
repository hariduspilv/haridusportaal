<?php

namespace Drupal\taxonomy_multidelete_terms;

/**
 * Batch Processor of the deletion of terms.
 */
class TaxonomyMultideleteBatch {

  /**
   * Process delete all the terms.
   *
   * @param string $tids
   *   The Term ID.
   * @param array $context
   *   The batch context.
   */
  public static function processTerms($tids, array $context) {
    $controller = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
    $entities = $controller->loadMultiple($tids);
    $controller->delete($entities);
    $context['results']['terms'] = count($tids);
  }

  /**
   * Display message about how many terms are deleted in the vocabulary.
   *
   * @param bool $success
   *   Success flag.
   * @param array $results
   *   Results from the batch handler.
   * @param array $operations
   *   Operations flag.
   */
  public static function finishProcess($success, array $results, array $operations) {
    if ($success) {
      $message = \Drupal::translation()
        ->formatPlural($results['terms'], '1 term deleted ', '@count terms deleted');
    }
    else {
      $message = t("Processed with errors");
    }
    \Drupal::messenger()->addMessage($message);
  }

}
