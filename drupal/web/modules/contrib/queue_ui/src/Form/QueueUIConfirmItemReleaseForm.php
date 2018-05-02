<?php

namespace Drupal\queue_ui\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

/**
 * Class QueueUIConfirmItemReleaseForm
 * @package Drupal\queue_ui\Form
 */
class QueueUIConfirmItemReleaseForm extends ConfirmFormBase {

  /**
   * @var string
   */
  protected $queue_name;

  /**
   * @var string
   */
  protected $queue_item;

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return t('Are you sure you want to release queue item %queue_item?', array('%queue_item' => $this->queue_item));
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
    return Url::fromUserInput("/" . QUEUE_UI_BASE . "/inspect/" . $this->queue_name);
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
    $queue = _queue_ui_queueclass($this->queue_name);
    $queue->release($this->queue_item);

    $form_state->setRedirectUrl(Url::fromUserInput("/" . QUEUE_UI_BASE . "/inspect/" . $this->queue_name));
  }
}
