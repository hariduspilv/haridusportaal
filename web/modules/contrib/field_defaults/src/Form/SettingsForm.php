<?php

namespace Drupal\field_defaults\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Messenger\Messenger;

/**
 * Class SettingsForm.
 */
class SettingsForm extends FormBase {

  /**
   * Config Factory.
   *
   * @var Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Messenger Service.
   *
   * @var Drupal\Core\Messenger\Messenger
   */
  protected $messenger;

  /**
   * {@inheritdoc}
   */
  public function __construct(ConfigFactoryInterface $configFactory, Messenger $messenger) {
    $this->configFactory = $configFactory;
    $this->messenger = $messenger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    // Instantiates this form class.
    return new static(
    // Load the service required to construct this class.
      $container->get('config.factory'),
      $container->get('messenger')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'field_defaults_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->configFactory->getEditable('field_defaults.configuration');

    $form['update_date'] = [
      '#title' => $this->t('Retain original entity updated time'),
      '#description' => $this->t('When default values are updated retain the entity original update date.'),
      '#type' => 'checkbox',
      '#default_value' => $config->get('update_date'),
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Submit'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->configFactory->getEditable('field_defaults.configuration');
    $config->set('update_date', $form_state->getValue('update_date'));
    $settings = $config->save();
    if ($settings) {
      $this->messenger()->addMessage($this->t('Settings saved'));
    }
  }

}
