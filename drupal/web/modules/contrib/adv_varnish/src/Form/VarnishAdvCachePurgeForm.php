<?php

namespace Drupal\adv_varnish\Form;

use Drupal\adv_varnish\VarnishInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Configure varnish settings for this site.
 */
class VarnishAdvCachePurgeForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function __construct(VarnishInterface $varnish_handler) {
    $this->varnishHandler = $varnish_handler;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('adv_varnish.handler')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'adv_varnish_cache_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['adv_varnish'] = [
      '#tree' => TRUE,
    ];

    // Display module status.
    $backend_status = $this->varnishHandler->varnishGetStatus();

    $_SESSION['messages'] = [];
    if (empty($backend_status)) {
      drupal_set_message($this->t('Varnish backend is not set.'), 'warning');
    }
    else {
      foreach ($backend_status as $backend => $status) {
        if (empty($status)) {
          drupal_set_message($this->t('Varnish at @backend not responding.', ['@backend' => $backend]), 'error');
        }
        else {
          drupal_set_message($this->t('Varnish at @backend connected.', ['@backend' => $backend]));
        }
      }
    }

    $form['adv_varnish_purge'] = [
      '#title' => $this->t('Purge settings'),
      '#type' => 'details',
      '#collapsible' => TRUE,
      '#open' => TRUE,
    ];

    $options = [
      'tag' => $this->t('Tag'),
      'request' => $this->t('Request'),
    ];
    $form['adv_varnish_purge']['type'] = [
      '#type' => 'radios',
      '#title' => $this->t('Select purge type'),
      '#options' => $options,
      '#default_value' => $form_state->getValue('type') ?: 'request',
      '#required' => TRUE,
    ];

    $form['adv_varnish_purge']['arguments'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Tag or request to purge.'),
      '#default_value' => $form_state->getValue('arguments'),
      '#required' => TRUE,
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Run purge'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    $form_state->disableRedirect();

    // Get type.
    $type = $form_state->getValue('type');

    // Get arguments.
    $arguments = $form_state->getValue('arguments');

    // Purge specified request or tag in varnish.
    if ($type == 'tag') {

      // Prepare arguments.
      $arguments = explode(',', $arguments);
      $arguments = array_map('trim', $arguments);

      // Purge tags.
      $result = $this->varnishHandler->purgeTags($arguments);
    }
    else {
      $result = $this->varnishHandler->purgeRequest($arguments);
    }

    // Display information about results.
    if (empty($result)) {
      drupal_set_message($this->t('Server refuse to execute command.'), 'error');
    }
    else {
      foreach ($result as $server => $commands) {
        foreach ($commands as $command => $status) {
          drupal_set_message($this->t('Server %server executed command %command successfully.', [
            '%server' => $server,
            '%command' => $command,
          ]));
        }
      }
    }
  }

}
