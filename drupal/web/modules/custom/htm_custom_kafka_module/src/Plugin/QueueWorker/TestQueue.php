<?php

namespace Drupal\htm_custom_kafka_module\Plugin\QueueWorker;


use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;


/**
 * Executes interface translation queue tasks.
 *
 * @QueueWorker(
 *   id = "kafka_log_worker",
 *   title = @Translation("Kafka log worker"),
 *   cron = {"time" = 30}
 * )
 */
class TestQueue extends QueueWorkerBase implements ContainerFactoryPluginInterface {

	public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
	{

	}

	public function processItem($data) {
		/*\Drupal::logger('my_module')->notice(print_r($data, TRUE));*/
	}

}
