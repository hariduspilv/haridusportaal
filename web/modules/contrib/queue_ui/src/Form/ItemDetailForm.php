<?php

namespace Drupal\queue_ui\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\queue_ui\QueueUIManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class QueueUIInspectForm
 * @package Drupal\queue_ui\Form
 */
class ItemDetailForm extends FormBase {

  /**
   * @var \Drupal\queue_ui\QueueUIManager
   */
  private $queueUIManager;

  /**
   * InspectForm constructor.
   *
   * @param \Drupal\queue_ui\QueueUIManager $queueUIManager
   */
  public function __construct(QueueUIManager $queueUIManager) {
    $this->queueUIManager = $queueUIManager;
  }

  /**
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   * @return static
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('plugin.manager.queue_ui')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'queue_ui_item_detail_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $queue_name = FALSE, $queue_item = FALSE) {
    if ($queue_ui = $this->queueUIManager->fromQueueName($queue_name)) {
      $queue_item = $queue_ui->loadItem($queue_item);

      $data = [
        '#type' => 'html_tag',
        '#tag' => 'pre' ,
        '#value' => print_r(unserialize($queue_item->data), TRUE)
      ];
      $data = \Drupal::service('renderer')->renderPlain($data);
      // Use kpr to print the data.
      if (\Drupal::service('module_handler')->moduleExists('devel')) {
        $data = kpr(unserialize($queue_item->data), TRUE);
      }

      $rows = [
        'id' => [
          'data' => [
            'header' => t('Item ID'),
            'data' => $queue_item->item_id,
          ],
        ],
        'queue_name' => [
          'data' => [
            'header' => t('Queue name'),
            'data' => $queue_item->name,
          ],
        ],
        'expire' => [
          'data' => [
            'header' => t('Expire'),
            'data' => ($queue_item->expire ? date(DATE_RSS, $queue_item->expire) : $queue_item->expire),
          ]
        ],
        'created' => [
          'data' => [
            'header' => t('Created'),
            'data' => date(DATE_RSS, $queue_item->created),
          ],
        ],
        'data' => [
          'data' => [
            'header' => ['data' => t('Data'), 'style' => 'vertical-align:top'],
            'data' => $data,
          ],
        ],
      ];

      return [
        'table' => [
          '#type' => 'table',
          '#rows' => $rows
        ],
      ];
    }
  }

  /**
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {}

}
