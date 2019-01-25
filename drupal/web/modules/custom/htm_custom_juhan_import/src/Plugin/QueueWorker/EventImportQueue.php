<?php
/**
 * @file
 * Contains \Drupal\import_school_data\Plugin\QueueWorker\CachePurgeQueue.
 */
namespace Drupal\htm_custom_juhan_import\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\htm_custom_juhan_import\Controller\ImportController;
/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_htm_custom_juhan_import",
 *   title = @Translation("Import task worker: juhan event import queue"),
 *   cron = {"time" = 30}
 * )
 */
class EventImportQueue extends QueueWorkerBase {
    /**
     * {@inheritdoc}
     */
    public function processItem($event) {
        $import_controller = new ImportController();
        $import_controller->save_event($event);
    }
}
