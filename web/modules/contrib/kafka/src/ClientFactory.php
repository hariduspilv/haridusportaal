<?php

namespace Drupal\kafka;

use Drupal\Core\Site\Settings;
use RdKafka\Conf;
use RdKafka\Consumer;
use RdKafka\KafkaConsumer;
use RdKafka\Producer;
use RdKafka\TopicConf;

/**
 * Class ClientFactory builds instances of producers and consumers.
 */
class ClientFactory {
  const METADATA_TIMEOUT = 1000;

  /**
   * The high-level consumer instance.
   *
   * @var \RdKafka\KafkaConsumer
   */
  protected $highLevelConsumer;

  /**
   * The producer instance.
   *
   * @var \RdKafka\Producer
   */
  protected $producer;

  /**
   * The Kafka settings.
   *
   * @var array
   */
  protected $settings;

  /**
   * ClientFactory constructor.
   *
   * @param \Drupal\Core\Site\Settings $settings
   *   The core settings service.
   */
  public function __construct(Settings $settings) {
    $this->settings = $settings->get('kafka');
  }

  /**
   * Return settings or one specific setting for consumers.
   *
   * @param null|string $key
   *   Optional. The key of a setting to return.
   * @param mixed $default
   *   Optional. The default value for a setting if $key is not empty.
   *
   * @return array|mixed|null
   *   - If key is empty, the consumer settings as a keyed array,
   *   - Else the value for the sêcificed setting, possibly defaulted.
   */
  public function consumerSettings($key = NULL, $default = NULL) {
    $settings = isset($this->settings['consumer'])
      ? $this->settings['consumer']
      : [];
    $ret = isset($key)
      ? (isset($settings[$key]) ? $settings[$key] : $default)
      : $settings;
    return $ret;
  }

  /**
   * Return settings or one specific setting for producers.
   *
   * @param null|string $key
   *   Optional. The key of a setting to return.
   * @param mixed $default
   *   Optional. The default value for a setting if $key is not empty.
   *
   * @return array|mixed|null
   *   - If key is empty, the consumer settings as a keyed array,
   *   - Else the value for the sêcificed setting, possibly defaulted.
   */
  public function producerSettings($key = NULL, $default = NULL) {
    $settings = isset($this->settings['producer'])
      ? $this->settings['producer']
      : [];
    $ret = isset($key)
      ? (isset($settings[$key]) ? $settings[$key] : $default)
      : $settings;
    return $ret;
  }

  /**
   * The client factory method.
   *
   * We always set the consumer group, not just for high-level consumers as
   * would be expected, to avoid crashes of the php-rdkafka extension.
   *
   * @param string $type
   *   Strings "low" and "high" for consumers, "producer" for producers.
   * @param \RdKafka\Conf|null $conf
   *   Optional. A configuration object. For high-level consumers, this is the
   *   only way to assign broker IP from settings.
   *
   * @return \RdKafka\Consumer|\RdKafka\KafkaConsumer|\RdKafka\Producer
   *   A client instance.
   */
  public function create($type, Conf $conf = NULL) {
    $consumerGroup = $this->consumerSettings('group.id', 'drupal4');
    $defaultBrokers = ['127.0.0.1:9092'];

    if (!isset($conf)) {
      $conf = new Conf();
    }
    $conf->set('group.id', $consumerGroup);

    $topicConf = new TopicConf();
    $topicConf->set('auto.offset.reset', 'smallest');
    $conf->setDefaultTopicConf($topicConf);

    switch ($type) {
      case 'low':
        $client = new Consumer($conf);
        $client->addBrokers(implode(',', $this->consumerSettings('brokers', $defaultBrokers)));
        break;

      case 'high':
        $brokers = implode(',', $this->consumerSettings('brokers', $defaultBrokers));
        $conf->set('metadata.broker.list', $brokers);
        $client = new KafkaConsumer($conf);
        break;

      case 'producer':
        $client = new Producer($conf);
        $client->addBrokers(implode(',', $this->producerSettings('brokers')));
        break;

      default:
        throw new \InvalidArgumentException("Invalid client type.");
    }

    return $client;
  }

  /**
   * Lazy fetch the high-level consumer instance.
   *
   * @return \RdKafka\KafkaConsumer
   *   The consumer instance.
   */
  public function highLevelConsumer() {
    if (!isset($this->highLevelConsumer)) {
      $this->setHighLevelConsumer($this->create('high'));
    }

    return $this->highLevelConsumer;
  }

  /**
   * Return the single producer instance known by this factory.
   *
   * @return \RdKafka\Producer
   *   The producer instance.
   */
  public function producer() {
    if (!isset($this->producer)) {
      $this->setProducer($this->create('producer'));
    }

    return $this->producer;
  }

  /**
   * Setter for the high-level consumer.
   *
   * @param \RdKafka\KafkaConsumer $consumer
   *   A consumer instance.
   */
  public function setHighLevelConsumer(KafkaConsumer $consumer) {
    $this->highLevelConsumer = $consumer;
  }

  /**
   * Set a customized producer as the instance know by this factory.
   *
   * @param \RdKafka\Producer $producer
   *   A producer instance.
   */
  public function setProducer(Producer $producer) {
    $this->producer = $producer;
  }

  /**
   * Return visible topics in the Kafka instance.
   *
   * @return string[]
   *   An array of topic names. May include system topics like
   *   __consumer_offsets.
   */
  public function getTopics() {
    $t0 = microtime(TRUE);
    $topics = [];

    // Expected time (local): 0.5 msec = 2000/sec.
    $sources = [
      $this->create('producer'),
      $this->create('low'),
    ];

    // Expected time per pass (local, 1 topic): 36 msec = 28/sec
    // Should be O(n)*O(m) per pass/topic.
    foreach ($sources as $rdk) {
      $rdk->setLogLevel(LOG_INFO);

      /** @var \RdKafka\Metadata $meta */
      $meta = $rdk->getMetadata(TRUE, NULL, self::METADATA_TIMEOUT);

      /** @var \RdKafka\Metadata\Collection $topics */
      $rkTopics = $meta->getTopics();

      /** @var \RdKafka\Metadata\Topic $topic */
      foreach ($rkTopics as $topic) {
        $topics[$topic->getTopic()] = NULL;
      }
    }

    // Expected time for 1 topics: 0.004 msec = 250k /sec
    // Should be O(n*log(n)) on topic count.
    $topics = array_keys($topics);
    sort($topics);

    $t1 = microtime(TRUE);

    $topics = [
      'topics' => $topics,
      'duration' => $t1 - $t0,
    ];

    return $topics;
  }

}
