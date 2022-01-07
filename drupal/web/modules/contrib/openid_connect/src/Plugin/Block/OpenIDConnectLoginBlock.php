<?php

namespace Drupal\openid_connect\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormBuilder;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'OpenID Connect login' block.
 *
 * @Block(
 *  id = "openid_connect_login",
 *  admin_label = @Translation("OpenID Connect login"),
 * )
 */
class OpenIDConnectLoginBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Drupal\openid_connect\Plugin\OpenIDConnectClientManager definition.
   *
   * @var \Drupal\openid_connect\Plugin\OpenIDConnectClientManager
   */
  protected $pluginManager;

  /**
   * The form builder.
   *
   * @var \Drupal\Core\Form\FormBuilder
   */
  protected $formBuilder;

  /**
   * Construct.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param string $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\openid_connect\Plugin\OpenIDConnectClientManager $plugin_manager
   *   The OpenID Connect client manager.
   * @param \Drupal\Core\Form\FormBuilder $form_builder
   *   The form builder.
   */
  public function __construct(
      array $configuration,
      $plugin_id,
      $plugin_definition,
      OpenIDConnectClientManager $plugin_manager,
      FormBuilder $form_builder
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);

    $this->pluginManager = $plugin_manager;
    $this->formBuilder = $form_builder;

  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('plugin.manager.openid_connect_client'),
      $container->get('form_builder')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    if ($account->isAnonymous()) {
      return AccessResult::allowed()
        ->addCacheContexts([
          'user.roles:anonymous',
        ]);
    }
    return AccessResult::forbidden();
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    return $this->formBuilder->getForm('Drupal\openid_connect\Form\OpenIDConnectLoginForm');
  }

}
