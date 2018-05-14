<?php


namespace Drupal\htm_custom_kafka_module\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\kafka\ClientFactory;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\HtmlCommand;

use Drupal\htm_custom_kafka_module\KafkaService;

#use Drupal\kafka;

use RdKafka\TopicConf;
use RdKafka\Conf;


/**
 * Class CustomKafkaStatusForm.
 */
class CustomKafkaStatusForm extends ConfigFormBase {

	/**
	 * The kafka.client_factory service.
	 *
	 * @var \Drupal\kafka\ClientFactory
	 */
	protected $clientFactory;

	/**
	 * The settings related to Kafka.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * The string_translation service.
	 *
	 * @var \Drupal\Core\StringTranslation\TranslationInterface
	 */
	protected $translation;

	/**
	 * ReportController constructor.
	 *
	 * @param array $settings
	 *   The part of the settings related to Kafka.
	 * @param \Drupal\Core\StringTranslation\TranslationInterface $translation
	 *   The translation service.
	 * @param \Drupal\kafka\ClientFactory $clientFactory
	 *   The kafka.client_factory service.
	 */
	public function __construct(array $settings, TranslationInterface $translation, ClientFactory $clientFactory) {
		$this->clientFactory = $clientFactory;
		$this->settings = $settings;
		$this->translation = $translation;
	}

	/**
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container) {
		$clientFactory = $container->get('kafka.client_factory');
		$settings = $container->get('settings')->get('kafka');
		$translation = $container->get('string_translation');
		return new static($settings, $translation, $clientFactory);
	}


  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'htm_custom_kafka_module.customkafkastatus',
    ];
  }



  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'custom_kafka_status_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

		$header = [
				new TranslatableMarkup('Property', [], [], $this->translation),
				new TranslatableMarkup('Value', [], [], $this->translation),
		];
		$rows = [];

		$rows[] = [
				new TranslatableMarkup('Consumer brokers', [], [], $this->translation),
				['data' => json_encode($this->settings['consumer']['brokers'])],
		];
		$rows[] = [
				new TranslatableMarkup('Producer brokers', [], [], $this->translation),
				['data' => json_encode($this->settings['producer']['brokers'])],
		];
		$topics = $this->clientFactory->getTopics();
		//kint($topics);
		// $topic->consumeStart(0, RD_KAFKA_OFFSET_BEGINNING);
		//kint($this->clientFactory->create('low'));

		//$messages = $this->getMessages();

		$kafka_service = \Drupal::service('htm_custom_kafka_module.default');
		$test = $kafka_service->ConsumeNewMessages('logs');
		//kint($test);
		
			//kint($kafka_service->ConsumeNewMessages('logs'));
		//kint($messages);

		$rows[] = [
				new TranslatableMarkup('Topics', [], [], $this->translation), [
						'data' => [
								'#theme' => 'item_list',
								'#items' => $topics['topics'],
						],
				],
		];

		//kint($messages);

		$rows[] = [
				new TranslatableMarkup('Messages', [], [], $this->translation), [
						'data' => [
								'#theme' => 'table',
								'#rows' => $messages,
						],
				],
		];

		//$logs = $this->getMessagesLogs();

		/*$rows[] = [
				new TranslatableMarkup('Messages', [], [], $this->translation), [
						'data' => [
								'#theme' => 'item_list',
								'#items' => $logs,
						],
				],
		];*/


    $form['tabel'] = [
      '#type' => 'table',
      '#header' => $header,
			'#rows' => $rows,
    ];




    $form['idCode'] = [
			'#type' => 'textfield',
			'#title' => 'ID code',
			'#size' => 60,
			'#maxlenght' => 60,
			'#description' => '2 values: <br>38304110000, <br> 12345678901',
		];

		$form['wrapper'] = array('#markup' => '<div id="result"></div>');
		$form['request'] = [
			'#type' => 'submit',
			'#value' => 'Send Request',
			'#ajax' => [
				'callback' => '::test_response',
				'wrapper' => 'wrapper',
				'method' => 'replace',
				'effect' => 'fade',
			],
			#'#submit' => array([$this, 'sendRequest']),
		];
		//kint(RD_KAFKA_OFFSET_STORED);
		//kint(RD_KAFKA_OFFSET_BEGINNING);
		//kint(RD_KAFKA_OFFSET_END);
		//kint($form);

    return parent::buildForm($form, $form_state);
  }

  public function test_response(array $form, FormStateInterface $form_state){
		$ajax_response = new AjaxResponse();
		$text = '';
		$id_code = $form_state->getValue('idCode');
		if(!empty($id_code)){
			/** @var \RdKafka\Producer $rk */
			$rk = \Drupal::service('kafka.producer');
			$rk->setLogLevel(LOG_WARNING);
			$topic = $rk->newTopic('requests');

			$object = [
					'personalIdCode' =>  $form_state->getValue('idCode'),
			];

			$topic->produce(RD_KAFKA_PARTITION_UA, 0, json_encode($object));
			$text = 'Id kood: '. $id_code. ' saadetud Kafkasse';
		}else{
			$text = 'Id kood tühi';
		}
		$ajax_response->addCommand(new HtmlCommand('#result', $text));
		return $ajax_response;

	}


	/**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);

    $this->config('htm_custom_kafka_module.customkafkastatus')
      ->set('tabel', $form_state->getValue('tabel'))
      ->save();
  }



	public function getMessages(){
		$rk = \Drupal::service('kafka.low_level_consumer');
		$rk->setLogLevel(LOG_WARNING);
		$debug = FALSE;

		$topicConf = new TopicConf();
		$topicConf->set('offset.store.method', 'broker');
		$topicConf->set('auto.offset.reset', 'smallest');
		$topicConf->set('auto.commit.interval.ms', 100);

		/** @var \RdKafka\ConsumerTopic $topic */
		$topic = $rk->newTopic('responses', $topicConf);

		//kint($topicConf->dump());

		// The first argument is the partition to consume from.
		// The second argument is the offset at which to start consumption. Valid
		// values are: RD_KAFKA_OFFSET_BEGINNING, RD_KAFKA_OFFSET_END,
		// RD_KAFKA_OFFSET_STORED.
		$topic->consumeStart(0, RD_KAFKA_OFFSET_STORED);


		while (true) {
			$msg = $topic->consume(0, 120*1000);
			//kint($msg);
			//if(!empty($msg)) {
				if ($msg->err) {
					//break;\
				} else {
					if (!empty($msg->payload)) {
						\Drupal::logger('kafka_log')->notice($msg->payload);
					}
					//echo 'test';
				}
			//}
		}
		$topic->consumeStop(0);

		return '';
	}

	public function getMessagesLogs(){
		$rk = \Drupal::service('kafka.low_level_consumer');
		$rk->setLogLevel(LOG_WARNING);
		$debug = FALSE;

		$topicConf = new TopicConf();
		$topicConf->set('offset.store.method', 'broker');
		$topicConf->set('auto.offset.reset', 'smallest');
		$topicConf->set('auto.commit.interval.ms', 100);

		/** @var \RdKafka\ConsumerTopic $topic */
		$topic = $rk->newTopic('logs', $topicConf);

		// The first argument is the partition to consume from.
		// The second argument is the offset at which to start consumption. Valid
		// values are: RD_KAFKA_OFFSET_BEGINNING, RD_KAFKA_OFFSET_END,
		// RD_KAFKA_OFFSET_STORED.
		$topic->consumeStart(0, RD_KAFKA_OFFSET_BEGINNING);

		//print_r (($t0 = time()) . "\n");
		$count = 0;
		while (TRUE) {
			$count++;
			// The first argument is the partition (again).
			// The second argument is the timeout.
			$msg = $topic->consume(0, 1000);
			if ($msg->err) {
				$info['errors'] = $msg->payload;
				break;
			}

			$msg_parsed = json_decode($msg->payload);
			kint($msg_parsed);
			$info[] = $msg_parsed;
			/*elseif ($debug) {
				drush_print('Message: [' . $msg->payload . "]");
			}*/
		}
		$topic->consumeStop(0);
		//kint($info);
		return $info;
		/*print_r ("count: $count\n");
		print_r (($t1 = time()) . "\n");
		print_r ("delay: " . ($t1 - $t0) . "\n");*/
	}

	function getMessagesnmred(){

  	$config = ConsumerConfig::getInstance();
  	$config->setMetadataRefreshIntervalMs(10000);
  	$config->setMetadataBrokerList('213.180.8.133:30092');
  	//$config->setGroupId('test');
  	//$config->setBrokerVersion('1.0.0');
  	$config->setTopics(['responses']);
  	$config->setOffsetReset('earliest');

  	$config->setSessionTimeout(10);

  	$consumer = new Consumer();
		$consumer->start(function ($topic, $part, $message): void {
			/*kint($message);*/
			\Drupal::logger('my_module')->notice($message);
		});


  	$info = [
			['value' => 'test1'],
			['value' => 'test2'],
		];



  	return $info;


	}

}
