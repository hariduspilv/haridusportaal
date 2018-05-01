<?php

namespace Drupal\conditional_fields\Form;

use Drupal\Core\Form\FormStateInterface;

/**
 * Class ConditionalFieldEditFormTab.
 *
 * @package Drupal\conditional_fields\Form
 */
class ConditionalFieldEditFormTab extends ConditionalFieldEditForm {

  protected $redirectPath = 'conditional_fields.tab';

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'conditional_field_edit_form_tab';
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);
    $values = $form_state->cleanValues()->getValues();
    $parameters = ['node_type' => $values['bundle']];

    $form_state->setRedirect($this->redirectPath, $parameters);

  }

}
