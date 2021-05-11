<?php

namespace Drupal\openid_connect\Plugin\OpenIDConnectClient;

use Drupal\Core\Form\FormStateInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;

/**
 * Okta OpenID Connect client.
 *
 * Implements OpenID Connect Client plugin for Okta.
 *
 * @OpenIDConnectClient(
 *   id = "okta",
 *   label = @Translation("Okta")
 * )
 */
class OpenIDConnectOktaClient extends OpenIDConnectClientBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'okta_domain' => '',
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['okta_domain'] = [
      '#title' => $this->t('Okta domain'),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['okta_domain'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getEndpoints() {
    // From https://developer.okta.com/docs/reference/api/oidc and
    // https://${yourOktaDomain}/.well-known/openid-configuration
    return [
      'authorization' => 'https://' . $this->configuration['okta_domain'] . '/oauth2/v1/authorize',
      'token' => 'https://' . $this->configuration['okta_domain'] . '/oauth2/v1/token',
      'userinfo' => 'https://' . $this->configuration['okta_domain'] . '/oauth2/v1/userinfo',
    ];
  }

}
