<?php

namespace Drupal\adv_varnish\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\State\StateInterface;
use Drupal\Core\Form\ConfigFormBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Datetime\DateFormatter;
use Drupal\adv_varnish\VarnishInterface;

/**
 * Configure varnish settings for this site.
 */
class VarnishAdvCacheSettingsForm extends ConfigFormBase {

  /**
   * Stores the state storage service.
   *
   * @var \Drupal\Core\State\StateInterface
   */
  protected $state;

  /**
   * Stores the state storage service.
   *
   * @var \Drupal\adv_varnish\VarnishInterface
   */
  protected $varnishHandler;

  /**
   * @var DateFormatter
   */
  protected $dateFormatter;

  /**
   * The Messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * {@inheritdoc}
   */
  public function __construct(ConfigFactoryInterface $config_factory,
                              StateInterface $state,
                              DateFormatter $date_formatter,
                              VarnishInterface $varnish_handler,
                              MessengerInterface $messenger) {
    parent::__construct($config_factory);
    $this->state = $state;
    $this->dateFormatter = $date_formatter;
    $this->varnishHandler = $varnish_handler;
    $this->messenger = $messenger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('state'),
      $container->get('date.formatter'),
      $container->get('adv_varnish.handler'),
      $container->get('messenger')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'adv_varnish_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['adv_varnish.settings'];
  }

  /**
   * Varnish config form.
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('adv_varnish.settings');
    // Display module status.
    $this->checkBackendStatus();
    $form['adv_varnish'] = ['#tree' => TRUE];
    $form['adv_varnish']['general'] = [
      '#title' => $this->t('General settings'),
      '#type' => 'details',
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    ];
    $form['adv_varnish']['general']['enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Varnish Caching'),
      '#default_value' => $config->get('general.enabled'),
    ];
    $form['adv_varnish']['general']['esi'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Varnish ESI'),
      '#default_value' => $config->get('general.esi'),
    ];
    $form['adv_varnish']['general']['logging'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Logging'),
      '#default_value' => $config->get('general.logging'),
    ];
    $form['adv_varnish']['general']['debug'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Debug mode'),
      '#default_value' => $config->get('general.debug'),
    ];
    $form['adv_varnish']['general']['grace'] = [
      '#title' => $this->t('Grace'),
      '#type' => 'select',
      '#options' => $this->getGraceOptions(),
      '#description' => $this->getGraceHint(),
      '#default_value' => $config->get('general.grace'),
    ];
    $form['adv_varnish']['general']['page_cache_maximum_age'] = [
      '#type' => 'select',
      '#title' => $this->t('Page cache maximum age'),
      '#default_value' => $config->get('general.page_cache_maximum_age'),
      '#options' => $this->getMaxAgePeriod(),
      '#description' => $this->t('The maximum time a page can be cached by varnish.'),
    ];
    $form['adv_varnish']['general']['esi_cache_maximum_age'] = [
      '#type' => 'select',
      '#title' => $this->t('Esi callback cache maximum age'),
      '#default_value' => $config->get('general.esi_cache_maximum_age'),
      '#options' => $this->getMaxAgePeriod(),
      '#description' => $this->t('The maximum time a ESI element can be cached by varnish.'),
    ];
    // Connection settings.
    $form['adv_varnish']['connection'] = [
      '#title' => $this->t('Varnish Connection settings'),
      '#type' => 'details',
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    ];
    $form['adv_varnish']['connection']['control_terminal'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Control Terminal'),
      '#default_value' => $config->get('connection.control_terminal'),
      '#required' => TRUE,
      '#description' => $this->t('Set this to the server IP or hostname that varnish runs on (e.g. 127.0.0.1:6082). This must be configured for Drupal to talk to Varnish. Separate multiple servers with spaces.'),
    ];
    $form['adv_varnish']['connection']['control_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Control Key'),
      '#default_value' => $config->get('connection.control_key'),
      '#description' => $this->t('Optional: if you have established a secret key for control terminal access, please put it here.'),
    ];
    $form['adv_varnish']['connection']['socket_timeout'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Connection timeout (milliseconds)'),
      '#default_value' => $config->get('connection.socket_timeout'),
      '#description' => $this->t('If Varnish is running on a different server, you may need to increase this value.'),
      '#required' => TRUE,
    ];
    // Availability settings.
    $form['adv_varnish']['available'] = [
      '#title' => $this->t('Availability settings'),
      '#type' => 'details',
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    ];
    $form['adv_varnish']['available']['exclude'] = [
      '#title' => $this->t('Excluded URLs'),
      '#type' => 'textarea',
      '#description' => $this->t('Specify excluded request urls @format.', ['@format' => '<SERVER_NAME>|<partial REQUEST_URI *>']),
      '#default_value' => $config->get('available.exclude'),
    ];
    $form['adv_varnish']['available']['authenticated_users'] = [
      '#title' => $this->t('Enable varnish for authenticated users'),
      '#type' => 'checkbox',
      '#description' => $this->t('Check if you want enable Varnish support for authenticated users.'),
      '#default_value' => $config->get('available.authenticated_users'),
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function getGracehint() {
    return $this->t("Grace in the scope of Varnish means delivering otherwise expired objects when circumstances call for it.
      This can happen because the backend-director selected is down or a different thread has already made a request to the backend that's not yet finished."
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getGraceOptions() {
    // Get grace.
    $options = [10, 30, 60, 120, 300, 600, 900, 1800, 3600];
    $options = array_map([$this->dateFormatter, 'formatInterval'], array_combine($options, $options));
    $options[0] = $this->t('No Grace (bad idea)');
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function getMaxAgePeriod() {
    // Cache time for Varnish.
    $period = [0, 60, 180, 300, 600, 900, 1800, 2700,
      3600, 10800, 21600, 32400, 43200, 86400, 31536000,
    ];
    $period = array_map([$this->dateFormatter, 'formatInterval'], array_combine($period, $period));
    $period[0] = $this->t('no caching');
    return $period;
  }

  /**
   * {@inheritdoc}
   */
  public function getTtlPeriod() {
    // Get ttl time.
    $period = [3, 5, 10, 15, 30, 60, 120, 180, 240, 300, 600, 900, 1200,
      1800, 3600, 7200, 14400, 28800, 43200, 86400, 172800, 259200, 345600, 604800,
    ];
    $period = array_map([$this->dateFormatter, 'formatInterval'], array_combine($period, $period));
    $period[-1] = $this->t('Pass through');
    ksort($period);
    return $period;
  }

  /**
   * {@inheritdoc}
   */
  public function checkBackendStatus() {
    // Display module status.
    $backend_status = $this->varnishHandler->varnishGetStatus();

    $_SESSION['messages'] = [];
    if (empty($backend_status)) {
      $this->messenger->addMessage($this->t('Varnish backend is not set.'), 'warning');
    }
    else {
      foreach ($backend_status as $backend => $status) {
        if (empty($status)) {
          $this->messenger->addMessage($this->t('Varnish at @backend not responding.', ['@backend' => $backend]), 'error');
        }
        else {
          $this->messenger->addMessage($this->t('Varnish at @backend connected.', ['@backend' => $backend]));
        }
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    // Save config values.
    $values = $form_state->getValue('adv_varnish');
    $this->config('adv_varnish.settings')
      ->set('connection', $values['connection'])
      ->set('general', $values['general'])
      ->set('available', $values['available'])
      ->save();

    parent::submitForm($form, $form_state);
  }

}
