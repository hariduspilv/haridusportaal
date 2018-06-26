<?php

namespace Drupal\graphql_custom_translation\Plugin\QueueWorker;

use Drupal\Component\Uuid\UuidInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Queue\QueueWorkerInterface;
use Drupal\Core\Site\Settings;
use Drupal\kafka\ClientFactory;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\kafka\Queue\KafkaQueue;
use Drupal\kafka\Queue\KafkaQueueFactory;



/**
 * Executes interface translation queue tasks.
 *
 * @QueueWorker(
 *   id = "htmTestTopic",
 *   title = @Translation("Testing"),
 *   cron = {"time" = 30}
 * )
 */
class TestQueue extends KafkaQueue implements QueueWorkerInterface {

	/**
	 * The plugin_id.
	 *
	 * @var string
	 */
	protected $pluginId;

	/**
	 * The plugin implementation definition.
	 *
	 * @var array
	 */
	protected $pluginDefinition;

	/**
	 * Configuration information passed into the plugin.
	 *
	 * When using an interface like
	 * \Drupal\Component\Plugin\ConfigurablePluginInterface, this is where the
	 * configuration should be stored.
	 *
	 * Plugin configuration is optional, so plugin implementations must provide
	 * their own setters and getters.
	 *
	 * @var array
	 */
	protected $configuration;



	/**
	 * Constructs a Drupal\Component\Plugin\PluginBase object.
	 *
	 * @param array $configuration
	 *   A configuration array containing information about the plugin instance.
	 * @param string $plugin_id
	 *   The plugin_id for the plugin instance.
	 * @param mixed $plugin_definition
	 *   The plugin implementation definition.
	 */


	public function __construct($plugin_id, $plugin_definition)
	{
		/*\Drupal::logger('my_module')->notice(print_r($data, TRUE));*/
		$this->pluginId = $plugin_id;
		$this->pluginDefinition = $plugin_definition;
	}

	public function getPluginId()
	{
		return $this->pluginId;
		// TODO: Implement getPluginId() method.
	}

	public function getPluginDefinition()
	{
		return $this->pluginDefinition;
		// TODO: Implement getPluginDefinition() method.
	}


	public function processItem($data) {
		/*\Drupal::logger('my_module')->notice(print_r($data, TRUE));*/
	}

}
