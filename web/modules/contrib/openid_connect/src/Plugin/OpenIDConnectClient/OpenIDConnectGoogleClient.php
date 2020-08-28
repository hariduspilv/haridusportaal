<?php

namespace Drupal\openid_connect\Plugin\OpenIDConnectClient;

use Drupal\Core\Form\FormStateInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;

/**
 * Google OpenID Connect client.
 *
 * Implements OpenID Connect Client plugin for Google.
 *
 * @OpenIDConnectClient(
 *   id = "google",
 *   label = @Translation("Google")
 * )
 */
class OpenIDConnectGoogleClient extends OpenIDConnectClientBase {

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $url = 'https://console.developers.google.com/project/_/apiui/apis/library';
    $form['description'] = [
      '#markup' => '<div class="description">' . $this->t('Set up your app in <a href="@url" target="_blank">Google API Console</a>.', ['@url' => $url]) . '</div>',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getEndpoints() {
    // Data from https://accounts.google.com/.well-known/openid-configuration
    return [
      'authorization' => 'https://accounts.google.com/o/oauth2/v2/auth',
      'token' => 'https://oauth2.googleapis.com/token',
      'userinfo' => 'https://openidconnect.googleapis.com/v1/userinfo',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function retrieveUserInfo($access_token) {
    $userinfo = parent::retrieveUserInfo($access_token);
    if ($userinfo) {
      // For some reason Google returns the URI of the profile picture in a
      // weird format: "https:" appears twice in the beginning of the URI.
      // Using a regular expression matching for fixing it guarantees that
      // things won't break if Google changes the way the URI is returned.
      preg_match('/https:\/\/*.*/', $userinfo['picture'], $matches);
      $userinfo['picture'] = $matches[0];
    }

    return $userinfo;
  }

}
