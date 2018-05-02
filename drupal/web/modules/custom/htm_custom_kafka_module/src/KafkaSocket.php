<?php

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

while (true) {
	$message = $topic->consume(0, 120*10000);
	switch ($message->err) {
		case RD_KAFKA_RESP_ERR_NO_ERROR:
			var_dump($message);
			break;
		case RD_KAFKA_RESP_ERR__PARTITION_EOF:
			echo "No more messages; will wait for more\n";
			break;
		case RD_KAFKA_RESP_ERR__TIMED_OUT:
			echo "Timed out\n";
			break;
		default:
			throw new \Exception($message->errstr(), $message->err);
			break;
	}
}