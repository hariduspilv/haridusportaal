<?php

namespace Drupal\queue_ui\Form;

use Drupal\Core\Database\Database;
use Drupal\Core\Extension\ModuleHandler;
use Drupal\Core\Messenger\Messenger;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueInterface;
use Drupal\Core\Queue\QueueWorkerManager;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\State\StateInterface;
use Drupal\Core\TempStore\PrivateTempStoreFactory;
use Drupal\Core\Url;
use Drupal\queue_ui\QueueUIInterface;
use Drupal\queue_ui\QueueUIManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class QueueUIOverviewForm
 * @package Drupal\queue_ui\Form
 */
class OverviewForm extends FormBase {

  /**
   * The queue factory.
   *
   * @var \Drupal\Core\Queue\QueueFactory
   */
  protected $queueFactory;

  /**
   * The tempstore factory.
   *
   * @var \Drupal\Core\TempStore\PrivateTempStoreFactory
   */
  protected $tempStoreFactory;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * The Drupal state storage.
   *
   * @var \Drupal\Core\State\StateInterface
   */
  protected $state;

  /**
   * The Drupal module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandler
   */
  protected $moduleHandler;

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $dbConnection;

  /**
   * @var \Drupal\Core\Queue\QueueWorkerManager
   */
  private $queueWorkerManager;

  /**
   * @var \Drupal\queue_ui\QueueUIManager
   */
  private $queueUIManager;

  /**
   * OverviewForm constructor.
   *
   * @param \Drupal\Core\Queue\QueueFactory $queue_factory
   * @param \Drupal\Core\TempStore\PrivateTempStoreFactory $temp_store_factory
   * @param \Drupal\Core\Session\AccountInterface $current_user
   * @param \Drupal\Core\State\StateInterface $state
   * @param \Drupal\Core\Extension\ModuleHandler $module_handler
   * @param \Drupal\Core\Queue\QueueWorkerManager $queueWorkerManager
   * @param \Drupal\queue_ui\QueueUIManager $queueUIManager
   * @param \Drupal\Core\Messenger\Messenger $messenger
   */
  public function __construct(QueueFactory $queue_factory, PrivateTempStoreFactory $temp_store_factory, AccountInterface $current_user, StateInterface $state, ModuleHandler $module_handler, QueueWorkerManager $queueWorkerManager, QueueUIManager $queueUIManager, Messenger $messenger) {
    $this->queueFactory = $queue_factory;
    $this->tempStoreFactory = $temp_store_factory;
    $this->currentUser = $current_user;
    $this->state = $state;
    $this->moduleHandler = $module_handler;
    $this->dbConnection = Database::getConnection('default');

    $this->queueWorkerManager = $queueWorkerManager;
    $this->queueUIManager = $queueUIManager;
    $this->messenger = $messenger;
  }

  /**
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   * @return static
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('queue'),
      $container->get('tempstore.private'),
      $container->get('current_user'),
      $container->get('state'),
      $container->get('module_handler'),
      $container->get('plugin.manager.queue_worker'),
      $container->get('plugin.manager.queue_ui'),
      $container->get('messenger')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'queue_ui_overview_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['top'] = [
      'operation' => [
        '#type' => 'select',
        '#title' => $this->t('Action'),
        '#options' => [
          'submitBatch' => $this->t('Batch process'),
          'submitRelease' => $this->t('Remove leases'),
          'submitClear' => $this->t('Clear'),
        ],
      ],
      'actions' => [
        '#type' => 'container',
        '#attributes' => [
          'class' => ['form-actions'],
        ],
        'apply' => [
          '#type' => 'submit',
          '#tableselect' => TRUE,
          '#submit' => ['::submitBulkForm'],
          '#value' => $this->t('Apply to selected items'),
        ],
      ],
    ];

    $form['queues'] = [
      '#type' => 'table',
      '#tableselect' => TRUE,
      '#header' => [
        'title' => $this->t('Title'),
        'items' => $this->t('Number of items'),
        'class' => $this->t('Class'),
        'cron' => $this->t('Cron time limit (seconds)'),
        'operations' => $this->t('Operations'),
      ],
      '#empty' => $this->t('No queues defined'),
    ];

    $queue_order_installed = $this->moduleHandler->moduleExists('queue_order');
    if ($queue_order_installed) {
      // Add the dragable options for the form.
      $form['queues']['#tabledrag'] = [
        [
          'action' => 'order',
          'relationship' => 'sibling',
          'group' => 'queue-order-weight',
        ],
      ];

      // Add the weight to the table header.
      $form['queues']['#header']['weight'] = $this->t('Weight');
      $form['weight'] = [
        '#type' => 'value',
      ];
    }

    // Get queues names.
    $queues = $this->queueWorkerManager->getDefinitions();
    foreach ($queues as $name => $queue_definition) {
      $queue = $this->queueFactory->get($name);

      $operations = [];
      // If queue inspection is enabled for this implementation.
      if ($queue_ui = $this->queueUIManager->fromQueueName($name)) {
        $operations['inspect'] = [
          'title' => $this->t('Inspect'),
          'url' => Url::fromRoute('queue_ui.inspect', ['queue_name' => $name]),
        ];
      }

      $row = [
        'title' => [
          '#markup' => (string) $queue_definition['title'],
        ],
        'items' => [
          '#markup' => $queue->numberOfItems(),
        ],
        'class' => [
          '#markup' => $this->queueUIManager->queueClassName($queue),
        ],
        'cron' => [
          '#type' => 'number',
          '#title' => $this->t('Cron Time'),
          '#title_display' => 'hidden',
          '#placeholder' => $this->t('Cron disabled'),
          '#value' => (isset($queue_definition['cron']['time']) ? $queue_definition['cron']['time'] : ''),
          '#parents' => [],
          '#name' => 'cron[' . $name . ']',
        ],
        'operations' => [
          '#type' => 'dropbutton',
          '#links' => $operations,
        ],
      ];

      // Enable sort if queue_order is enabled.
      if ($queue_order_installed) {
        $weight = isset($queue_definition['weight']) ? $queue_definition['weight'] : 10;
        $row['#attributes'] = ['class' => ['draggable']];
        $row['#weight'] = $weight;
        $row['weight'] = [
          '#type' => 'weight',
          '#title' => $this->t('Weight for @title', ['@title' => $name]),
          '#title_display' => 'invisible',
          '#default_value' => $weight,
          '#name' => 'weight[' . $name . ']',
          // Classify the weight element for #tabledrag.
          '#attributes' => ['class' => ['queue-order-weight']],
        ];
      }

      $form['queues'][$name] = $row;
    }

    $form['cron'] = [
      '#type' => 'value',
    ];

    $form['botton'] = [
      'actions' => [
        '#type' => 'container',
        '#attributes' => [
          'class' => ['form-actions'],
        ],
        'apply' => [
          '#type' => 'submit',
          '#tableselect' => TRUE,
          '#submit' => ['::submitBulkForm'],
          '#value' => $this->t('Apply to selected items'),
        ],
        'save' => [
          '#type' => 'submit',
          '#value' => $this->t('Save changes'),
        ],
      ],
    ];

    return $form;
  }

  /**
   * We need this method, but each button has its own submit handler.
   *
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $form_state->cleanValues();

    foreach ($form_state->getValue('cron') as $name => $time) {
      $this->state->set('queue_ui_cron_' . $name, $time);
    }

    // Only save the weight if the queue_order module is available.
    if ($this->moduleHandler->moduleExists('queue_order')) {
      $order_config = $this->configFactory()->getEditable('queue_order.settings');
      // Save the weight of the defined workers.
      foreach ($form_state->getValue('weight') as $name => $weight) {
        $order_config->set('order.' . $name, (int) $weight);
      }
      $order_config->save();
    }

    // Clear the cached plugin definition so that changes come into effect.
    $this->queueWorkerManager->clearCachedDefinitions();
  }

  /**
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   */
  public function submitBulkForm(array &$form, FormStateInterface $form_state) {
    if (in_array($form_state->getValue('operation'), [
      'submitBatch',
      'submitRelease',
      'submitClear'
    ])) {
      $selected_queues = array_filter($form_state->getValue('queues'));

      if (!empty($selected_queues)) {
        $this->{$form_state->getValue('operation')}($form_state, $selected_queues);
      }
    }
  }

  /**
   * Process queue(s) with batch.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   * @param $queues
   */
  public function submitBatch(FormStateInterface $form_state, $queues) {
    $batch = [
      'title' => $this->t('Processing queues'),
      'operations' => [],
      'finished' => ['\Drupal\queue_ui\QueueUIBatch', 'finish'],
    ];

    foreach ($queues as $queue_name) {
      $batch['operations'][] = ['\Drupal\queue_ui\QueueUIBatch::step', [$queue_name]];
    }

    batch_set($batch);
  }

  /**
   * Option to remove lease timestamps.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   * @param $queues
   */
  public function submitRelease(FormStateInterface $form_state, $queues) {
    foreach ($queues as $queue_name) {
      /** @var QueueUIInterface $queue_ui */
      if ($queue_ui = $this->queueUIManager->fromQueueName($queue_name)) {
        $num_updated = $queue_ui->releaseItems($queue_name);

        $this->messenger->addMessage($this->t('@count lease reset in queue @name', [
          '@count' => $num_updated,
          '@name' => $queue_name
        ]));
      }
    }
  }

  /**
   * Option to delete queue.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   * @param $queues
   */
  public function submitClear(FormStateInterface $form_state, $queues) {
    $this->tempStoreFactory->get('queue_ui_clear_queues')
      ->set($this->currentUser->id(), $queues);

    $form_state->setRedirect('queue_ui.confirm_clear_form');
  }
}
