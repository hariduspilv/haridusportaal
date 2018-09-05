<?php

namespace Drupal\openid_connect\Plugin\OpenIDConnectClient;

use Drupal\Core\Form\FormStateInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;

/**
 * LinkedIn OpenID Connect client.
 *
 * Implements OpenID Connect Client plugin for LinkedIn.
 *
 * @OpenIDConnectClient(
 *   id = "linkedin",
 *   label = @Translation("LinkedIn")
 * )
 */
class Linkedin extends OpenIDConnectClientBase {

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $url = 'https://www.linkedin.com/developer/apps';
    $form['description'] = [
      '#markup' => '<div class="description">' . $this->t('Set up your app in <a href="@url" target="_blank">my apps</a> on LinkedIn.', ['@url' => $url]) . '</div>',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getEndpoints() {
    return [
      'authorization' => 'https://www.linkedin.com/oauth/v2/authorization',
      'token' => 'https://www.linkedin.com/oauth/v2/accessToken',
      'userinfo' => 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)?format=json',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function authorize($scope = 'openid email') {
    // Use LinkedIn specific authorisations.
    return parent::authorize('r_basicprofile r_emailaddress');
  }

  /**
   * {@inheritdoc}
   */
  public function decodeIdToken($id_token) {
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function retrieveUserInfo($access_token) {
    $userinfo = parent::retrieveUserInfo($access_token);

    if ($userinfo) {
      $userinfo['email'] = $userinfo['emailAddress'];
      $userinfo['sub'] = $userinfo['id'];
      $userinfo['picture'] = $userinfo['pictureUrl'];

      unset($userinfo['emailAddress'], $userinfo['id'], $userinfo['pictureUrl']);
    }

    return $userinfo;
  }

}
