<?php

namespace Drupal\graphql_custom_translation\Plugin\QueueWorker;

use Drupal\Component\Uuid\UuidInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Site\Settings;
use Drupal\kafka\ClientFactory;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\kafka\Queue\KafkaQueue;
use Drupal\kafka\Queue\KafkaQueueFactory;



/**
 * Executes interface translation queue tasks.
 *
 * @QueueWorker(
 *   id = "htmTestTopic_2",
 *   title = @Translation("Testing"),
 *   cron = {"time" = 30}
 * )
 */
class uusQueue extends QueueWorkerBase{
	/**
	 * {@inheritdoc}
	 *
	 * The translation update functions executed here are batch operations which
	 * are also used in translation update batches. The batch functions may need
	 * to be executed multiple times to complete their task, typically this is the
	 * translation import function. When a batch function is not finished, a new
	 * queue task is created and added to the end of the queue. The batch context
	 * data is needed to continue the batch task is stored in the queue with the
	 * queue data.
	 */
	public function processItem($data) {
		die();
	}

}
