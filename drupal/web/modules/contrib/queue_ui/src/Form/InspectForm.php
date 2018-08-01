<?php

namespace Drupal\queue_ui\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\queue_ui\QueueUIManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class InspectForm
 * @package Drupal\queue_ui\Form
 */
class InspectForm extends FormBase {

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
    return 'queue_ui_inspect_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $queue_name = FALSE) {
    if ($queue_ui = $this->queueUIManager->fromQueueName($queue_name)) {

      $rows = [];
      foreach ($queue_ui->getItems($queue_name) as $item) {
        $operations = [];
        foreach ($queue_ui->getOperations() as $op => $title) {
          $operations[] = [
            'title' => $title,
            'url' => Url::fromRoute('queue_ui.inspect.' . $op, ['queue_name' => $queue_name, 'queue_item' => $item->item_id]),
          ];
        }

        $rows[] = [
          'id' => $item->item_id,
          'expires' => ($item->expire ? date(DATE_RSS, $item->expire) : $item->expire),
          'created' => date(DATE_RSS, $item->created),
          'operations' => [
            'data' => [
              '#type' => 'dropbutton',
              '#links' => $operations,
            ],
          ]
        ];
      }

      return [
        'table' => [
          '#type' => 'table',
          '#header' => [
            'id' => t('Item ID'),
            'expires' => t('Expires'),
            'created' => t('Created'),
            'operations' => t('Operations'),
          ],
          '#rows' => $rows
        ],
        'pager' => [
          '#type' => 'pager'
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
