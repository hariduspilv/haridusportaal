<?php

namespace Drupal\htm_custom_kafka_module;

use Drupal\Core\Datetime\DateFormatter;
use Psr\Log\LoggerInterface;
use RdKafka\Consumer;
use RdKafka\TopicConf;

/**
 * Class KafkaService.
 */
class KafkaService implements KafkaServiceInterface {

	/**
	 * Date formatter service object.
	 *
	 * @var \Drupal\Core\Datetime\DateFormatter
	 */
	protected $dateFormatter;

	/**
	 * Scheduler Logger service object.
	 *
	 * @var \Psr\Log\LoggerInterface
	 */
	protected $logger;

	/**
	 * The low-level consumer instance.
	 *
	 * @var \RdKafka\KafkaConsumer
	 */
	protected $lowLevelConsumer;


	/**
	 * KafkaService constructor.
	 */
	public function __construct(DateFormatter $dateFormatter, LoggerInterface $logger, Consumer $lowLevelConsumer){
		$this->dateFormatter = $dateFormatter;
		$this->logger = $logger;
		$this->lowLevelConsumer = $lowLevelConsumer;
	}


	/**
	 * @param $topic
	 */
	public function ConsumeNewMessages($topic){
		$topicConf = $this->getTopicConf();
		kint($topicConf->dump());
		$topic = $this->lowLevelConsumer->newTopic($topic, $topicConf);
		kint($topic);
		kint(RD_KAFKA_OFFSET_STORED);	
		
		$topic->consumeStart(0, RD_KAFKA_OFFSET_STORED);
		$count = 0;
		while(true){
			$msg = $topic->consume(0, 120*1000);
	dump($msg);			
if($msg) {
				if($msg->err == -191){
					break;
				}elseif($msg->err != -191){
					$this->logMessages($msg->payload);
				}
			}else{
				break;
			}
			$count++;
		}
		$topic->consumeStop(0);
	}


	/**
	 * @return TopicConf
	 */
	private function getTopicConf(){
		$topicConf = new TopicConf();
		$topicConf->set('offset.store.method', 'broker');
		$topicConf->set('auto.offset.reset', 'smallest');
		$topicConf->set('auto.commit.interval.ms', 1e3);
		$topicConf->set("offset.store.sync.interval.ms", 60e3);
		//$topicConf->set('group.id', 'drupal');
		//kint($topicConf->dump());		
return $topicConf;
	}


	/**
	 * @param $payload
	 */
	private function logMessages($payload){
		$payload_object = json_decode($payload);
		kint($payload_object);
		$logger_type = $payload_object->type;
		$logger_severty = $payload_object->severity;
		$logger_message = $payload_object->message;

		$payload_starttime = $payload_object->startTime / 1000;
		$payload_endtime = $payload_object->endTime / 1000;


		$this->logger->{$logger_severty}($logger_type . ': ' .$logger_message . '<br><br> Request date: @request_date <br>Request duration: @duration', [
			'@request_date' => $this->dateFormatter->format($payload_starttime, 'shortdr'),
			'@duration' => $this->dateFormatter->formatDiff($payload_starttime, $payload_endtime),
		]);
	}



}
