<?php

namespace Drupal\queue_ui\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\Messenger;
use Drupal\Core\Url;
use Drupal\queue_ui\QueueUIManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ConfirmItemReleaseForm
 * @package Drupal\queue_ui\Form
 */
class ConfirmItemReleaseForm extends ConfirmFormBase {

  /**
   * @var string
   */
  protected $queue_name;

  /**
   * @var string
   */
  protected $queue_item;

  /**
   * @var \Drupal\queue_ui\QueueUIManager
   */
  private $queueUIManager;

  /**
   * ConfirmItemReleaseForm constructor.
   *
   * @param \Drupal\Core\Messenger\Messenger $messenger
   * @param \Drupal\queue_ui\QueueUIManager $queueUIManager
   */
  public function __construct(Messenger $messenger, QueueUIManager $queueUIManager) {
    $this->messenger = $messenger;
    $this->queueUIManager = $queueUIManager;
  }

  /**
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   * @return static
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('messenger'),
      $container->get('plugin.manager.queue_ui')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return t('Are you sure you want to release queue item %queue_item?', ['%queue_item' => $this->queue_item]);
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return t('This action cannot be undone and will force the release of the item even if it is currently being processed.');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return Url::fromRoute('queue_ui.inspect', ['queue_name' => $this->queue_name]);
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'queue_ui_confirm_item_delete_form';
  }

  /**
   * {@inheritdoc}
   *
   * @param bool $queue_name
   * @param bool $queue_item
   */
  public function buildForm(array $form, FormStateInterface $form_state, $queue_name = FALSE, $queue_item = FALSE) {
    $this->queue_name = $queue_name;
    $this->queue_item = $queue_item;

    return parent::buildForm($form, $form_state);
  }

  /**
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $queue_ui = $this->queueUIManager->fromQueueName($this->queue_name);
    $queue_ui->releaseItem($this->queue_item);

    $this->messenger->addMessage("Released queue item " . $this->queue_item);
    $form_state->setRedirectUrl(Url::fromRoute('queue_ui.inspect', ['queue_name' => $this->queue_name]));
  }
}
