<?php

namespace Drupal\conditional_fields\Form;

/**
 * Class ConditionalFieldFormTab.
 *
 * @package Drupal\conditional_fields\Form
 */
class ConditionalFieldFormTab extends ConditionalFieldForm {

  protected $editPath = 'conditional_fields.edit_form.tab';

  protected $deletePath = 'conditional_fields.delete_form.tab';

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'conditional_field_form_tab';
  }

}
