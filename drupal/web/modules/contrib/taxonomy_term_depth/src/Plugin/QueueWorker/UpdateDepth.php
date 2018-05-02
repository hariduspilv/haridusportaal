<?php

namespace Drupal\taxonomy_term_depth\Plugin\QueueWorker;

use Drupal\aggregator\FeedInterface;
use Drupal\Core\Queue\QueueWorkerBase;

/**
 * Updates a feed's items.
 *
 * @QueueWorker(
 *   id = "taxonomy_term_depth_update_depth",
 *   title = @Translation("Taxonomy term depth update"),
 *   cron = {"time" = 300}
 * )
 */
class UpdateDepth extends QueueWorkerBase {

  /**
   * {@inheritdoc}
   */
  public function processItem($data) {
    taxonomy_term_depth_get_by_tid($data['tid'], TRUE);
  }
}
