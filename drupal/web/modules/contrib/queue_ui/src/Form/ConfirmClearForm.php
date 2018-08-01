<?php

namespace Drupal\queue_ui\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\Messenger;
use Drupal\Core\TempStore\PrivateTempStoreFactory;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ConfirmClearForm
 * @package Drupal\queue_ui\Form
 */
class ConfirmClearForm extends ConfirmFormBase {

  /**
   * @var PrivateTempStoreFactory
   */
  private $tempStoreFactory;

  /**
   * ConfirmClearForm constructor.
   *
   * @param \Drupal\Core\TempStore\PrivateTempStoreFactory $temp_store_factory
   * @param \Drupal\Core\Messenger\Messenger $messenger
   */
  public function __construct(PrivateTempStoreFactory $temp_store_factory, Messenger $messenger) {
    $this->tempStoreFactory = $temp_store_factory;
    $this->messenger = $messenger;
  }

  /**
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   * @return static
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('tempstore.private'),
      $container->get('messenger')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'queue_ui_confirm_clear_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Retrieve the queues to be deleted from the temp store.
    $queues = $this->tempStoreFactory
      ->get('queue_ui_clear_queues')
      ->get($this->currentUser()->id());
    if (!$queues) {
      return $this->redirect('queue_ui.overview_form');
    }

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    $queues = $this->tempStoreFactory
      ->get('queue_ui_clear_queues')
      ->get($this->currentUser()->id());

    return $this->formatPlural(count($queues), 'Are you sure you want to clear the queue?', 'Are you sure you want to clear @count queues?');
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return t('All items in each queue will be deleted, regardless of if leases exist. This operation cannot be undone.');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('queue_ui.overview_form');
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $queues = $this->tempStoreFactory
      ->get('queue_ui_clear_queues')
      ->get($this->currentUser()->id());

    foreach ($queues as $name) {
      $queue = \Drupal::queue($name);
      $queue->deleteQueue();
    }

    $this->messenger->addMessage($this->formatPlural(count($queues), 'Queue deleted', '@count queues cleared'));
    $form_state->setRedirect('queue_ui.overview_form');
  }
}
