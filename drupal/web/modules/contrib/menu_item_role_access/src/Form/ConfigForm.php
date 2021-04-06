<?php

namespace Drupal\menu_item_role_access\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class ConfigForm.
 */
class ConfigForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'menu_item_role_access.config',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'menu_item_role_access_config';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('menu_item_role_access.config');

    $form['overwrite_internal_link_target_access'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Overwrite internal link target access check'),
      '#description' => $this->t("When this option is checked, this module will ignore the access check of the menu target. For example: when a user does not have access to a node he will not see the menu item for this node. With this option checked the user will be able to see the menu item, but only if the user's role is allowed."),
      '#default_value' => $config->get('overwrite_internal_link_target_access') ?? FALSE,
    ];
    $form['inherit_parent_access'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Allow parents to override children'),
      '#description' => $this->t('Allow children items to inherit the menu item access of their parents.'),
      '#default_value' => $config->get('inherit_parent_access') ?? FALSE,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);
    $values = $form_state->getValues();

    $this->config('menu_item_role_access.config')
      ->set('overwrite_internal_link_target_access', $values['overwrite_internal_link_target_access'])
      ->set('inherit_parent_access', $values['inherit_parent_access'])
      ->save();
  }

}
