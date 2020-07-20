<?php

namespace Drupal\jwt_path_auth\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class ConfigForm.
 *
 * @package Drupal\jwt\Form
 */
class PathConfigForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'jwt_path_auth.config',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'jwt_path_auth_config_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['help'] = [
      '#markup' => $this->t('Configure path prefixes where a JWT may be used in the query string to authenticate.'),
    ];

    $form['allowed_path_prefixes'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Path Prefixes'),
      '#default_value' => implode("\n", $this->config('jwt_path_auth.config')->get('allowed_path_prefixes')),
      '#description' => $this->t('Enter one path prefix value per line.'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
    $string = $form_state->getValue('allowed_path_prefixes');
    $list = explode("\n", $string);
    $list = array_map('trim', $list);
    $prefix_list = array_filter($list, 'strlen');

    foreach ($prefix_list as $path) {
      if ($path[0] !== '/') {
        $form_state->setErrorByName('allowed_path_prefixes', $this->t('Paths must start with a slash.'));
        return;
      }
    }
    $form_state->setTemporaryValue('prefix_list', $prefix_list);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);

    $prefix_list = $form_state->getTemporaryValue('prefix_list');
    $this->config('jwt_path_auth.config')->set('allowed_path_prefixes', $prefix_list)->save();
  }

}
