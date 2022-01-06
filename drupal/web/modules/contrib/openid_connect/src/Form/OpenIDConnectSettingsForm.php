<?php

namespace Drupal\openid_connect\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\SubformState;
use Drupal\openid_connect\OpenIDConnect;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\openid_connect\Plugin\OpenIDConnectClientManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides the OpenID Connect settings form.
 *
 * @package Drupal\openid_connect\Form
 */
class OpenIDConnectSettingsForm extends ConfigFormBase implements ContainerInjectionInterface {

  /**
   * The OpenID Connect service.
   *
   * @var \Drupal\openid_connect\OpenIDConnect
   */
  protected $openIDConnect;

  /**
   * Drupal\openid_connect\Plugin\OpenIDConnectClientManager definition.
   *
   * @var \Drupal\openid_connect\Plugin\OpenIDConnectClientManager
   */
  protected $pluginManager;

  /**
   * The entity manager.
   *
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;

  /**
   * The OpenID Connect claims.
   *
   * @var \Drupal\openid_connect\OpenIDConnectClaims
   */
  protected $claims;

  /**
   * OpenID Connect client plugins.
   *
   * @var \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface[]
   */
  protected static $clients;

  /**
   * The constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\openid_connect\OpenIDConnect $openid_connect
   *   The OpenID Connect service.
   * @param \Drupal\openid_connect\Plugin\OpenIDConnectClientManager $plugin_manager
   *   The plugin manager.
   * @param \Drupal\Core\Entity\EntityFieldManagerInterface $entity_field_manager
   *   The entity field manager.
   * @param \Drupal\openid_connect\OpenIDConnectClaims $claims
   *   The claims.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    OpenIDConnect $openid_connect,
    OpenIDConnectClientManager $plugin_manager,
    EntityFieldManagerInterface $entity_field_manager,
    OpenIDConnectClaims $claims
  ) {
    parent::__construct($config_factory);
    $this->openIDConnect = $openid_connect;
    $this->pluginManager = $plugin_manager;
    $this->entityFieldManager = $entity_field_manager;
    $this->claims = $claims;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('openid_connect.openid_connect'),
      $container->get('plugin.manager.openid_connect_client'),
      $container->get('entity_field.manager'),
      $container->get('openid_connect.claims')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['openid_connect.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'openid_connect_admin_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $settings = $this->configFactory()
      ->getEditable('openid_connect.settings');

    $form['#tree'] = TRUE;
    $form['clients_enabled'] = [
      '#title' => $this->t('Enabled OpenID Connect clients'),
      '#description' => $this->t('Choose enabled OpenID Connect clients.'),
      '#type' => 'checkboxes',
    ];

    $clients = $this->getClients();
    $options = [];
    $clients_enabled = [];

    foreach ($clients as $client_plugin) {
      $plugin_definition = $client_plugin->getPluginDefinition();
      $plugin_id = $plugin_definition['id'];
      $plugin_label = $plugin_definition['label'];

      $options[$plugin_id] = $plugin_label;
      $enabled = $this->configFactory()
        ->getEditable('openid_connect.settings.' . $plugin_id)
        ->get('enabled');
      $clients_enabled[$plugin_id] = (bool) $enabled ? $plugin_id : 0;

      $element = 'clients_enabled[' . $plugin_id . ']';
      $form['clients'][$plugin_id] = [
        '#title' => $plugin_label,
        '#type' => 'fieldset',
        '#tree' => TRUE,
        '#states' => [
          'visible' => [
            ':input[name="' . $element . '"]' => ['checked' => TRUE],
          ],
        ],
      ];
      $form['clients'][$plugin_id]['settings'] = [];
      $subform_state = SubformState::createForSubform($form['clients'][$plugin_id]['settings'], $form, $form_state);
      $form['clients'][$plugin_id]['settings'] += $client_plugin->buildConfigurationForm($form['clients'][$plugin_id]['settings'], $subform_state);
    }

    $form['clients_enabled']['#options'] = $options;
    $form['clients_enabled']['#default_value'] = $clients_enabled;

    $form['override_registration_settings'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Override registration settings'),
      '#description' => $this->t('If enabled, a user will be registered even if registration is set to "Administrators only".'),
      '#default_value' => $settings->get('override_registration_settings'),
    ];

    $form['always_save_userinfo'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Save user claims on every login'),
      '#description' => $this->t('If disabled, user claims will only be saved when the account is first created.'),
      '#default_value' => $settings->get('always_save_userinfo'),
    ];

    $form['user_login_display'] = [
      '#type' => 'radios',
      '#title' => $this->t('OpenID buttons display in user login form'),
      '#options' => [
        'hidden' => $this->t('Hidden'),
        'above' => $this->t('Above'),
        'below' => $this->t('Below'),
        'replace' => $this->t('Replace'),
      ],
      '#description' => $this->t("Modify the user login form to show the the OpenID login buttons. If the 'Replace' option is selected, only the OpenID buttons will be displayed. In this case, pass the 'showcore' URL parameter to return to a password-based login form."),
      '#default_value' => $settings->get('user_login_display'),
    ];

    $form['userinfo_mappings'] = [
      '#title' => $this->t('User claims mapping'),
      '#type' => 'fieldset',
    ];

    $form['override_registration_settings'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Override registration settings'),
      '#description' => $this->t('If enabled, user creation will always be allowed, even if the registration setting is set to require admin approval, or only allowing admins to create users.'),
      '#default_value' => $settings->get('override_registration_settings'),
    ];

    $properties = $this->entityFieldManager->getFieldDefinitions('user', 'user');
    $properties_skip = $this->openIDConnect->userPropertiesIgnore();
    $claims = $this->claims->getOptions();
    $mappings = $settings->get('userinfo_mappings');
    foreach ($properties as $property_name => $property) {
      if (isset($properties_skip[$property_name])) {
        continue;
      }
      // Always map the timezone.
      $default_value = '';
      if ($property_name == 'timezone') {
        $default_value = 'zoneinfo';
      }

      $form['userinfo_mappings'][$property_name] = [
        '#type' => 'select',
        '#title' => $property->getLabel(),
        '#description' => $property->getDescription(),
        '#options' => (array) $claims,
        '#empty_value' => '',
        '#empty_option' => $this->t('- No mapping -'),
        '#default_value' => isset($mappings[$property_name]) ? $mappings[$property_name] : $default_value,
      ];
    }

    $form['advanced'] = [
      '#title' => $this->t('Advanced'),
      '#type' => 'details',
      '#open' => $settings->get('connect_existing_users') ? TRUE : FALSE,
    ];
    $form['advanced']['connect_existing_users'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Automatically connect existing users'),
      '#description' => $this->t('<strong><em>Please note:</em> This option has security implications, only use with trusted OpenID Connect providers.</strong><br />If disabled, authentication will fail for accounts with existing email addresses, users may connect existing accounts on their personal Connected Accounts page in a secure way.'),
      '#default_value' => $settings->get('connect_existing_users'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);

    // Get clients' enabled status.
    $clients_enabled = $form_state->getValue('clients_enabled');
    // Get client plugins.
    $clients = $this->getClients();

    // Trigger validation for enabled clients.
    foreach ($clients_enabled as $plugin_id => $status) {
      // Whether the client is not enabled.
      if (!(bool) $status) {
        continue;
      }

      // Get subform and subform state.
      $subform = $form['clients'][$plugin_id]['settings'];
      $subform_state = SubformState::createForSubform($subform, $form, $form_state);

      // Let the plugin validate its form.
      $clients[$plugin_id]->validateConfigurationForm($subform, $subform_state);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);

    $this->config('openid_connect.settings')
      ->set('always_save_userinfo', $form_state->getValue('always_save_userinfo'))
      ->set('connect_existing_users', $form_state->getValue([
        'advanced',
        'connect_existing_users',
      ]))
      ->set('override_registration_settings', $form_state->getValue('override_registration_settings'))
      ->set('userinfo_mappings', array_filter($form_state->getValue('userinfo_mappings')))
      ->set('user_login_display', $form_state->getValue('user_login_display'))
      ->save();

    // Get clients' enabled status.
    $clients_enabled = $form_state->getValue('clients_enabled');
    // Get client plugins.
    $clients = $this->getClients();

    // Save client settings.
    foreach ($clients_enabled as $plugin_id => $status) {
      $this->configFactory()
        ->getEditable('openid_connect.settings.' . $plugin_id)
        ->set('enabled', (bool) $status)
        ->save();

      // Whether the client is not enabled.
      if (!(bool) $status) {
        continue;
      }

      // Get subform and subform state.
      $subform = $form['clients'][$plugin_id]['settings'];
      $subform_state = SubformState::createForSubform($subform, $form, $form_state);

      // Let the plugin preprocess submitted values.
      $clients[$plugin_id]->submitConfigurationForm($subform, $subform_state);

      // Save plugin settings.
      $this->configFactory()
        ->getEditable('openid_connect.settings.' . $plugin_id)
        ->set('settings', $subform_state->getValues())
        ->save();
    }
  }

  /**
   * Return array of OpenID Connect client plugins.
   *
   * As the list of clients is used several times during form submission,
   * we are using this little helper method and a static collection of
   * initialized client plugins for this form.
   *
   * @return \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface[]
   *   Associative array of OpenID Connect client plugins with client IDs
   *   as keys and the corresponding initialized client plugins as values.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  protected function getClients() {
    if (!isset(self::$clients)) {
      $clients = [];

      $definitions = $this->pluginManager->getDefinitions();

      ksort($definitions);
      foreach ($definitions as $client_name => $client_plugin) {
        $configuration = $this->configFactory()
          ->getEditable('openid_connect.settings.' . $client_name)
          ->get('settings');

        /** @var \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $client */
        $client = $this->pluginManager->createInstance(
          $client_name,
          $configuration ?: []
        );

        $clients[$client_name] = $client;
      }

      self::$clients = $clients;
    }

    return self::$clients;
  }

}
