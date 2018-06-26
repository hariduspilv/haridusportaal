<?php

namespace Drupal\graphql_custom_translation\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use RdKafka\Consumer;
use Drupal\kafka\Queue\KafkaQueueFactory;

/**
 * Class KafkaCustomController.
 */
class KafkaCustomController extends ControllerBase {

  /**
   * RdKafka\Consumer definition.
   *
   * @var \RdKafka\Consumer
   */
  protected $kafkaLowLevelConsumer;
  /**
   * Drupal\kafka\Queue\KafkaQueueFactory definition.
   *
   * @var \Drupal\kafka\Queue\KafkaQueueFactory
   */
  protected $queueKafka;

  /**
   * Constructs a new KafkaCustomController object.
   */
  public function __construct(Consumer $kafka_low_level_consumer, KafkaQueueFactory $queue_kafka) {
    $this->kafkaLowLevelConsumer = $kafka_low_level_consumer;
    $this->queueKafka = $queue_kafka;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('kafka.low_level_consumer'),
      $container->get('queue.kafka')
    );
  }

  /**
   * Hello.
   *
   * @return string
   *   Return Hello string.
   */
  public function hello() {
  	kint($this);

    return 'test';
  }

}
