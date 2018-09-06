<?php

namespace Drupal\varnish_purger\Form;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface;
use Drupal\purge_ui\Form\PurgerConfigFormBase;
use Drupal\varnish_purger\Entity\VarnishPurgerSettings;


/**
 * Abstract form base for Varnish based configurable purgers.
 */
abstract class VarnishPurgerFormBase extends PurgerConfigFormBase {

  /**
   * The service that generates invalidation objects on-demand.
   *
   * @var \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface
   */
  protected $purgeInvalidationFactory;

  /**
   * Static listing of all possible requests methods.
   *
   * @todo
   *   Confirm if all relevant HTTP methods are covered.
   *   http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
   *
   * @var array
   */
  protected $request_methods = ['BAN', 'PURGE'];

  /**
   * Static listing of the possible connection schemes.
   *
   * @var array
   */
  protected $schemes = ['http', 'https'];


  /**
   * Group of token.
   *
   * @var array
   */
  protected $tokenGroups = '';


  /**
   * Constructs a \Drupal\varnish_purger\Form\ConfigurationForm object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface $purge_invalidation_factory
   *   The invalidation objects factory service.
   */
  public function __construct(ConfigFactoryInterface $config_factory, InvalidationsServiceInterface $purge_invalidation_factory) {
    $this->setConfigFactory($config_factory);
    $this->purgeInvalidationFactory = $purge_invalidation_factory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('purge.invalidation.factory')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormID() {
    return 'varnish_purger.configuration_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $settings = VarnishPurgerSettings::load($this->getId($form_state));
    $form['tabs'] = ['#type' => 'vertical_tabs', '#weight' => 10,];
    $this->buildFormMetadata($form, $form_state, $settings);
    $this->buildFormRequest($form, $form_state, $settings);
    $this->buildFormHeaders($form, $form_state, $settings);
    $this->buildFormPerformance($form, $form_state, $settings);
    $this->buildFormTokensHelp($form, $form_state, $settings);
    $this->buildFormSuccessResolution($form, $form_state, $settings);
    return parent::buildForm($form, $form_state);
  }

  /**
   * Build the 'metadata' section of the form.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param \Drupal\varnish_purger\Entity\VarnishPurgerSettings $settings
   *   Configuration entity for the purger being configured.
   */
  public function buildFormMetadata(array &$form, FormStateInterface $form_state, VarnishPurgerSettings $settings) {
    $form['name'] = [
      '#title' => $this->t('Name'),
      '#type' => 'textfield',
      '#description' => $this->t('A label that describes this purger.'),
      '#default_value' => $settings->name,
      '#required' => TRUE,
    ];
    $types = [];
    foreach ($this->purgeInvalidationFactory->getPlugins() as $type => $definition) {
      $types[$type] = (string)$definition['label'];
    }
    $form['invalidationtype'] = [
      '#type' => 'select',
      '#title' => $this->t('Type'),
      '#description' => $this->t('What sort of item will this purger clear?'),
      '#default_value' => $settings->invalidationtype,
      '#options' => $types,
      '#required' => FALSE,
    ];
  }

  /**
   * Build the 'request' section of the form.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param \Drupal\varnish_purger\Entity\VarnishPurgerSettings $settings
   *   Configuration entity for the purger being configured.
   */
  public function buildFormRequest(array &$form, FormStateInterface $form_state, VarnishPurgerSettings $settings) {
    $form['request'] = [
      '#type' => 'details',
      '#group' => 'tabs',
      '#title' => $this->t('Request'),
      '#description' => $this->t('In this section you configure how a single HTTP request looks like.')
    ];
    $form['request']['hostname'] = [
      '#title' => $this->t('Hostname'),
      '#type' => 'textfield',
      '#default_value' => $settings->hostname,
    ];
    $form['request']['port'] = [
      '#title' => $this->t('Port'),
      '#type' => 'textfield',
      '#default_value' => $settings->port,
    ];
    $form['request']['path'] = [
      '#title' => $this->t('Path'),
      '#type' => 'textfield',
      '#default_value' => $settings->path,
    ];
    $form['request']['request_method'] = [
      '#title' => $this->t('Request Method'),
      '#type' => 'select',
      '#default_value' => $this->request_methods[(int) array_search($settings->request_method, $this->request_methods)],
      '#options' => array_combine($this->request_methods, $this->request_methods),
    ];
    $form['request']['scheme'] = [
      '#title' => $this->t('Scheme'),
      '#type' => 'select',
      '#default_value' => $this->schemes[(int) array_search($settings->scheme, $this->schemes)],
      '#options' => array_combine($this->schemes, $this->schemes),
    ];
    $form['request']['verify'] = [
      '#title' => $this->t('Verify SSL certificate'),
      '#type' => 'checkbox',
      '#description' => $this->t("Uncheck to disable certificate verification (this is insecure!)."),
      '#default_value' => $settings->verify,
      '#states' => [
        'visible' => [
          ':input[name="scheme"]' => ['value' => 'https'],
        ]
      ]
    ];
  }

  /**
   * Build the 'headers' section of the form.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param \Drupal\varnish_purger\Entity\VarnishPurgerSettings $settings
   *   Configuration entity for the purger being configured.
   */
  public function buildFormHeaders(array &$form, FormStateInterface $form_state, VarnishPurgerSettings $settings) {
    if (is_null($form_state->get('headers_items_count'))) {
      $value = empty($settings->headers) ? 1 : count($settings->headers);
      $form_state->set('headers_items_count', $value);
    }
    $form['headers'] = [
      '#type' => 'details',
      '#group' => 'tabs',
      '#title' => $this->t('Headers'),
      '#description' => $this->t('Configure the outbound HTTP headers, leave
      empty to delete. Example for Tag as Type: Cache-Tags for Header and
      [invalidation:expression] for Value.')
    ];
    $form['headers']['headers'] = [
      '#tree' => TRUE,
      '#type' => 'table',
      '#header' => [$this->t('Header'), $this->t('Value')],
      '#prefix' => '<div id="headers-wrapper">',
      '#suffix' => '</div>'
    ];
    for ($i = 0; $i < $form_state->get('headers_items_count'); $i++) {
      if (!isset($form['headers']['headers'][$i])) {
        $header = isset($settings->headers[$i]) ? $settings->headers[$i] :
          ['field' => '', 'value' => ''];
        $form['headers']['headers'][$i]['field'] = [
          '#type' => 'textfield',
          '#default_value' => $header['field'],
          '#attributes' => ['style' => 'width: 100%;'],
        ];
        $form['headers']['headers'][$i]['value'] = [
          '#type' => 'textfield',
          '#default_value' => $header['value'],
          '#attributes' => ['style' => 'width: 100%;'],
        ];
      }
    }
    $form['headers']['add'] = [
      '#type' => 'submit',
      '#name' => 'add',
      '#value' => t('Add header'),
      '#submit' => [[$this, 'buildFormHeadersAdd']],
      '#ajax' => [
        'callback' => [$this, 'buildFormHeadersRebuild'],
        'wrapper' => 'headers-wrapper',
        'effect' => 'fade',
      ],
    ];
  }

  /**
   * Build the 'headers' section of the form: retrieves updated elements.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @return array
   */
  public function buildFormHeadersRebuild(array &$form, FormStateInterface $form_state) {
    return $form['headers']['headers'];
  }

  /**
   * Build the 'headers' section of the form: increments the item count.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function buildFormHeadersAdd(array &$form, FormStateInterface $form_state) {
    $count = $form_state->get('headers_items_count');
    $count++;
    $form_state->set('headers_items_count', $count);
    $form_state->setRebuild();
  }

  /**
   * Build the 'performance' section of the form.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param \Drupal\varnish_purger\Entity\VarnishPurgerSettings $settings
   *   Configuration entity for the purger being configured.
   */
  public function buildFormPerformance(array &$form, FormStateInterface $form_state, VarnishPurgerSettings $settings) {
    $form['performance'] = [
      '#type' => 'details',
      '#group' => 'tabs',
      '#title' => $this->t('Performance'),
    ];
    $form['performance']['cooldown_time'] = [
      '#type' => 'number',
      '#step' => 0.1,
      '#min' => 0.0,
      '#max' => 3.0,
      '#title' => $this->t('Cooldown time'),
      '#default_value' => $settings->cooldown_time,
      '#required' => TRUE,
      '#description' => $this->t('Number of seconds to wait after a group of HTTP requests (so that other purgers get fresh content)')
    ];
    $form['performance']['max_requests'] = [
      '#type' => 'number',
      '#step' => 1,
      '#min' => 1,
      '#max' => 500,
      '#title' => $this->t('Maximum requests'),
      '#default_value' => $settings->max_requests,
      '#required' => TRUE,
      '#description' => $this->t("Maximum number of HTTP requests that can be made during Drupal's execution lifetime. Usually PHP resource restraints lower this value dynamically, but can be met at the CLI.")
    ];
    $form['performance']['runtime_measurement'] = [
      '#title' => $this->t('Runtime measurement'),
      '#type' => 'checkbox',
      '#default_value' => $settings->runtime_measurement,
    ];
    $form['performance']['runtime_measurement_help'] = [
      '#type' => 'item',
      '#states' => [
        'visible' => [
          ':input[name="runtime_measurement"]' => ['checked' => FALSE]
        ]
      ],
      '#description' => $this->t('When you uncheck this setting, capacity will be based on the sum of both timeouts. By default, capacity will automatically adjust (up and down) based on measured time data.')
    ];
    $form['performance']['timeout'] = [
      '#type' => 'number',
      '#step' => 0.1,
      '#min' => 0.1,
      '#max' => 8.0,
      '#title' => $this->t('Timeout'),
      '#default_value' => $settings->timeout,
      '#required' => TRUE,
      '#states' => [
        'visible' => [
          ':input[name="runtime_measurement"]' => ['checked' => FALSE]
        ]
      ],
      '#description' => $this->t('The timeout of the request in seconds.')
    ];
    $form['performance']['connect_timeout'] = [
      '#type' => 'number',
      '#step' => 0.1,
      '#min' => 0.1,
      '#max' => 4.0,
      '#title' => $this->t('Connection timeout'),
      '#default_value' => $settings->connect_timeout,
      '#required' => TRUE,
      '#states' => [
        'visible' => [
          ':input[name="runtime_measurement"]' => ['checked' => FALSE]
        ]
      ],
      '#description' => $this->t('The number of seconds to wait while trying to connect to a server.')
    ];
  }

  /**
   * Build the 'tokens' section of the form.
   *
   * @todo
   *   This implementation depends on purge_tokens_token_info(), provided by the
   *   purge_token submodule. I'm aware this isn't the cleanest pattern but the
   *   most sensible way I can think of to get the supported token patterns.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param \Drupal\varnish_purger\Entity\VarnishPurgerSettings $settings
   *   Configuration entity for the purger being configured.
   */
  public function buildFormTokensHelp(array &$form, FormStateInterface $form_state, VarnishPurgerSettings $settings) {
    if (function_exists('purge_tokens_token_info')) {
      $tokens = purge_tokens_token_info()['tokens'];
      $form['tokens'] = [
        '#type' => 'details',
        '#group' => 'tabs',
        '#title' => $this->t('Tokens'),
        '#description' => $this->t('<p>Tokens are replaced for the <b>Path</b> and header <b>Value</b> fields.</p>'),
      ];
      $form['tokens']['table'] = [
        '#type' => 'table',
        '#responsive' => TRUE,
        '#header' => [
          'token' => [
            'data' => $this->t('Token'),
            'class' => [RESPONSIVE_PRIORITY_MEDIUM]
          ],
          'description' => [
            'data' => $this->t('Description'),
            'class' => [RESPONSIVE_PRIORITY_LOW]
          ],
        ],
      ];
      foreach ($this->tokenGroups as $token_group) {
        foreach (purge_tokens_token_info()['tokens'][$token_group] as $token => $info) {
          $token = sprintf('[%s:%s]', $token_group, $token);
          $form['tokens']['table'][$token]['token'] = [
            '#markup' => $this->t(
              '<b>@name</b><br /><code>@token</code>',
              ['@token' => $token, '@name' => $info['name']]
            ),
          ];
          $form['tokens']['table'][$token]['description'] = [
            '#markup' => $info['description']
          ];
        }
      }
    }
  }

  /**
   * Build the 'success resolution' section of the form.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param \Drupal\varnish_purger\Entity\VarnishPurgerSettings $settings
   *   Configuration entity for the purger being configured.
   */
  public function buildFormSuccessResolution(array &$form, FormStateInterface $form_state, VarnishPurgerSettings $settings) {
    $form['sr'] = [
      '#type' => 'details',
      '#group' => 'tabs',
      '#title' => $this->t('Success resolution'),
    ];
    $form['sr']['http_errors'] = [
      '#title' => $this->t('Treat 4XX and 5XX responses as a failed invalidation.'),
      '#type' => 'checkbox',
      '#default_value' => $settings->http_errors,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {

    // Validate that our timeouts stay between the boundaries purge demands.
    $timeout = $form_state->getValue('connect_timeout') + $form_state->getValue('timeout');
    if ($timeout > 10) {
      $form_state->setErrorByName('connect_timeout');
      $form_state->setErrorByName('timeout', $this->t('The sum of both timeouts cannot be higher than 10.00 as this would affect performance too negatively.'));
    }
    elseif ($timeout < 0.4) {
      $form_state->setErrorByName('connect_timeout');
      $form_state->setErrorByName('timeout', $this->t('The sum of both timeouts cannot be lower as 0.4 as this can lead to too many failures under real usage conditions.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitFormSuccess(array &$form, FormStateInterface $form_state) {
    $settings = VarnishPurgerSettings::load($this->getId($form_state));


    // Rewrite 'headers' so that it contains the exact right format for CMI.
    if (!is_null($submitted_headers = $form_state->getValue('headers'))) {
      $headers = [];
      foreach ($submitted_headers as $header) {
        if (strlen($header['field'] && strlen($header['value']))) {
          $headers[] = $header;
        }
      }
      $form_state->setValue('headers', $headers);
    }

    // Iterate the config object and overwrite values found in the form state.
    foreach ($settings as $key => $default_value) {
      if (!is_null($value = $form_state->getValue($key))) {
        $settings->$key = $value;
      }
    }
    $settings->save();
  }

}
