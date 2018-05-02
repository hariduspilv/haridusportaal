<?php

/**
 * @file
 * Drush plugin for Kafka module.
 *
 * These demo commands use the aggregator_feeds queue to take advantage of the
 * existing queue worker for that queue.
 */

use RdKafka\Conf;
use RdKafka\KafkaConsumer;
use RdKafka\TopicConf;
use RdKafka\TopicPartition;
use Symfony\Component\Yaml\Yaml;

/**
 * Implements hook_drush_command().
 */
function kafka_drush_command() {
  $file = preg_replace('/(inc|php)$/', 'yml', __FILE__);
  $config = Yaml::parse(file_get_contents($file));
  $items = $config['commands'];
  return $items;
}

/**
 * Helper for high-level consumer: dump the partition list.
 *
 * @param array<int,\RdKafka\TopicPartition> $partitions
 *   An array of the partitions by id.
 * @param null|string $label
 *   Optional. A label for the display.
 */
function _kafka_dump_partitions(array $partitions, $label = NULL) {
  if ($label) {
    /** @var \RdKafka\TopicPartition $partition */
    $partition = reset($partitions);
    echo $label . $partition->getTopic() . "\n";
  }
  echo implode('', array_map(function (TopicPartition $partition) {
    return sprintf('%4s:%-8s%s', $partition->getPartition(), $partition->getOffset(),
      ($partition->getPartition() + 1) % 10 ? '' : "\n");
  }, $partitions)) . "\n";
}

/**
 * Drush callback for "kafka-high-level-consumer-demo".
 *
 * @throws \Exception
 */
function drush_kafka_high_level_consumer_demo() {
  $conf = new Conf();
  $t0 = time();
  // Set a rebalance callback to log partition assignemts (optional)
  0 && $conf->setRebalanceCb(function (
    KafkaConsumer $kafka,
    $err,
    array $partitions = NULL
  ) {
    switch ($err) {
      case RD_KAFKA_RESP_ERR__ASSIGN_PARTITIONS:
        _kafka_dump_partitions($partitions, "Assign on: ");
        $kafka->assign($partitions);
        break;

      case RD_KAFKA_RESP_ERR__REVOKE_PARTITIONS:
        _kafka_dump_partitions($partitions, "Revoke on: ");
        $kafka->assign(NULL);
        break;

      default:
        throw new \Exception($err);
    }
  });

  $topicConf = new TopicConf();

  // Set where to start consuming messages when there is no initial offset in
  // offset store or the desired offset is out of range.
  // 'smallest': start from the beginning.
  $topicConf->set('auto.offset.reset', 'smallest');

  // Set the configuration to use for subscribed/assigned topics.
  $conf->setDefaultTopicConf($topicConf);

  /** @var \Drupal\kafka\ClientFactory $clientFactory */
  $clientFactory = \Drupal::service('kafka.client_factory');
  $consumer = $clientFactory->create('high', $conf);

  // Subscribe to topic 'drupal'.
  $consumer->subscribe(['aggregator_feeds']);

  echo "Waiting for partition assignment... (make take some time when\n";
  echo "quickly re-joining the group after leaving it.)\n";

  echo ($t1 = time()) . "\n";
  $count = 0;
  $continue = TRUE;
  while ($continue) {
    $message = $consumer->consume(120 * 1000);
    switch ($message->err) {
      case RD_KAFKA_RESP_ERR_NO_ERROR:
        // print_R($message);
        $count++;
        break;

      case RD_KAFKA_RESP_ERR__PARTITION_EOF:
        echo "No more messages; will not wait for more\n";
        $continue = FALSE;
        break;

      case RD_KAFKA_RESP_ERR__TIMED_OUT:
        echo "Timed out\n";
        $continue = FALSE;
        break;

      default:
        throw new \Exception($message->errstr(), $message->err);
    }
  }

  echo "count: $count\n";
  echo ($t2 = time()) . "\n";
  echo "setup: " . ($t1 - $t0) . " sec, delay: " . ($t2 - $t1) . "\n";

  if ($count) {
    $consumer->commit();
  }
  $consumer->unsubscribe();
}

/**
 * Drush callback for "kafka-low-level-consumer-demo".
 */
function drush_kafka_low_level_consumer_demo() {
  /** @var \RdKafka\Consumer $rk */
  $rk = \Drupal::service('kafka.low_level_consumer');
  $rk->setLogLevel(LOG_WARNING);
  $debug = FALSE;

  $topicConf = new TopicConf();
  $topicConf->set('offset.store.method', 'broker');
  $topicConf->set('auto.offset.reset', 'smallest');
  $topicConf->set('auto.commit.interval.ms', 100);
  /** @var \RdKafka\ConsumerTopic $topic */
  $topic = $rk->newTopic('drupal', $topicConf);

  // The first argument is the partition to consume from.
  // The second argument is the offset at which to start consumption. Valid
  // values are: RD_KAFKA_OFFSET_BEGINNING, RD_KAFKA_OFFSET_END,
  // RD_KAFKA_OFFSET_STORED.
  $topic->consumeStart(0, RD_KAFKA_OFFSET_BEGINNING);

  echo ($t0 = time()) . "\n";
  $count = 0;
  while (TRUE) {
    $count++;
    // The first argument is the partition (again).
    // The second argument is the timeout.
    $msg = $topic->consume(0, 30);
    if ($msg->err) {
      echo $msg->errstr(), "\n";
      break;
    }
    elseif ($debug) {
      drush_print('Message: [' . $msg->payload . "]");
    }
  }
  $topic->consumeStop(0);
  echo "count: $count\n";
  echo ($t1 = time()) . "\n";
  echo "delay: " . ($t1 - $t0) . "\n";
}

/**
 * Drush callback for "kafka-producer-demo".
 */
function drush_kafka_producer_demo() {
  /** @var \RdKafka\Producer $rk */
  $rk = \Drupal::service('kafka.producer');
  $rk->setLogLevel(LOG_WARNING);
  /** @var \RdKafka\Topic $topic */
  $topic = $rk->newTopic('aggregator_feeds');

  $max = 1E6;
  $t0 = microtime(TRUE);
  for ($i = 1; $i <= $max; $i++) {
    if ($i % ($max / 10) === 0) {
      echo "$i\t";
    }
    $topic->produce(RD_KAFKA_PARTITION_UA, 0, json_encode("Message $i (" . time() . ")"));
  }
  $t1 = microtime(TRUE);
  $rate = round($max / ($t1 - $t0));
  echo "\n$max messages @ $rate msg/sec\n";
}

/**
 * Drush callback for "kafka-topics".
 */
function drush_kafka_topics() {
  /** @var \Drupal\kafka\ClientFactory $clientFactory */
  $clientFactory = \Drupal::service('kafka.client_factory');
  $topics = $clientFactory->getTopics();
  $yamlTopics = Yaml::dump($topics);
  drush_print($yamlTopics);
}

/**
 * Drush callback for "kafka-queue-producer-demo".
 */
function drush_kafka_queue_producer_demo() {
  $q = \Drupal::queue('aggregator_feeds');
  // Ensure queue exists and it not deleted.
  $q->createQueue();
  $t0 = microtime(TRUE);
  $max = 10;
  foreach (range(1, $max) as $i) {
    if ($i % ceil($max / 10) === 0) {
      echo "$i\t";
    }
    $q->createItem("Message $i (" . time() . ")");
  }
  $t1 = microtime(TRUE);
  $rate = round($max / ($t1 - $t0));
  echo "\n$max messages @ $rate msg/sec\n";
}

/**
 * Drush callback for "kafka-queue-consumer-demo".
 */
function drush_kafka_queue_consumer_demo() {
  $q = \Drupal::queue('aggregator_feeds');
  // Ensure queue exists and it not deleted.
  $q->createQueue();
  $t1 = $t0 = microtime(TRUE);
  $count = 0;
  $oldLap = $t0;
  while ($item = $q->claimItem(1)) {
    if ($count === 0) {
      // Check the time to first claim, caused by Kafka allocation.
      $t1 = microtime(TRUE);
    }
    $q->deleteItem($item);
    $newLap = microtime(TRUE);
    if ($newLap - $oldLap > 1) {
      $oldLap = $newLap;
      echo "$count\t";
    }
    $count++;
  }
  $t2 = microtime(TRUE);
  echo "count: $count\n";
  echo "setup: " . round($t1 - $t0) . " sec, delay: " . round($t2 - $t1);
  if ($count) {
    echo " = " . (($count - 1) / round($t2 - $t1)) . " items/sec";
  }
  echo PHP_EOL;
}
