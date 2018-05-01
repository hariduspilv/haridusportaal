<?php

namespace Drupal\queue_ui\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\user\PrivateTempStoreFactory;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class QueueUIConfirmDeleteForm
 * @package Drupal\queue_ui\Form
 */
class QueueUIConfirmDeleteForm extends ConfirmFormBase {

  /**
   * @var PrivateTempStoreFactory
   */
  private $tempStoreFactory;

  /**
   * QueueUIConfirmDeleteForm constructor.
   * @param \Drupal\user\PrivateTempStoreFactory $temp_store_factory
   */
  public function __construct(PrivateTempStoreFactory $temp_store_factory) {
    $this->tempStoreFactory = $temp_store_factory;
  }

  /**
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   * @return static
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('user.private_tempstore')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'queue_ui_confirm_delete_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Retrieve the queues to be deleted from the temp store.
    $queues = $this->tempStoreFactory
      ->get('queue_ui_delete_queues')
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
      ->get('queue_ui_delete_queues')
      ->get($this->currentUser()->id());

    return $this->formatPlural(count($queues), 'Are you sure you want to delete the queue?', 'Are you sure you want to delete @count queues?');
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
      ->get('queue_ui_delete_queues')
      ->get($this->currentUser()->id());

    foreach ($queues as $name) {
      $queue = \Drupal::queue($name);
      $queue->deleteQueue();
    }
    drupal_set_message($this->formatPlural(count($queues), 'Queue deleted', '@count queues deleted'));

    $form_state->setRedirect('queue_ui.overview_form');
  }
}
