<?php

namespace Drupal\queue_ui\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class QueueUIInspectForm
 * @package Drupal\queue_ui\Form
 */
class QueueUIItemDetailForm extends FormBase {

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
    if ($queue = _queue_ui_queueclass($queue_name)) {
      return $queue->view($queue_item);
    }
  }

  /**
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {}
}
