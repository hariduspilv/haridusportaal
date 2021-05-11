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
class OpenIDConnectLinkedinClient extends OpenIDConnectClientBase {

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
      'userinfo' => 'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
      'useremail' => 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function authorize($scope = 'openid email') {
    // Use LinkedIn specific authorisations.
    return parent::authorize('r_liteprofile r_emailaddress');
  }

  /**
   * {@inheritdoc}
   */
  public function decodeIdToken($id_token) {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function retrieveUserInfo($access_token) {
    $userinfo = [];
    $info = parent::retrieveUserInfo($access_token);

    if ($info) {
      $userinfo['sub'] = isset($info['id']) ? $info['id'] : '';
      $userinfo['first_name'] = isset($info['localizedFirstName']) ? $info['localizedFirstName'] : '';
      $userinfo['last_name'] = isset($info['localizedLastName']) ? $info['localizedLastName'] : '';
      $userinfo['name'] = $userinfo['first_name'] . ' ' . $userinfo['last_name'];

      if (isset($info['profilePicture']['displayImage~']['elements'])) {
        // The picture was provided.
        $pictures = $info['profilePicture']['displayImage~']['elements'];
        // The last picture should have the largest picture of size 800x800 px.
        $last_picture = end($pictures);

        if (isset($last_picture['identifiers'][0]['identifier'])) {
          $userinfo['picture'] = $last_picture['identifiers'][0]['identifier'];
        }
      }
      else {
        // The picture was not provided.
        $userinfo['picture'] = '';
      }
    }

    // Get the email. It should always be provided.
    if ($email = $this->retrieveUserEmail($access_token)) {
      $userinfo['email'] = $email;
    }

    return $userinfo;
  }

  /**
   * Get user email.
   *
   * @param string $access_token
   *   An access token string.
   *
   * @return string|bool
   *   An email or false.
   */
  protected function retrieveUserEmail($access_token) {
    $request_options = [
      'headers' => [
        'Authorization' => 'Bearer ' . $access_token,
        'Accept' => 'application/json',
      ],
    ];
    $endpoints = $this->getEndpoints();

    try {
      $response = $this->httpClient->get($endpoints['useremail'], $request_options);
      $object = json_decode((string) $response->getBody(), TRUE);

      if (isset($object['elements'])) {
        foreach ($object['elements'] as $element) {
          if (isset($element['handle~']['emailAddress'])) {
            // The email address was found.
            return $element['handle~']['emailAddress'];
          }
        }
      }
    }
    catch (\Exception $e) {
      $variables = [
        '@message' => 'Could not retrieve user email information',
        '@error_message' => $e->getMessage(),
      ];
      $this->loggerFactory->get('openid_connect_' . $this->pluginId)
        ->error('@message. Details: @error_message', $variables);
    }

    // No email address was provided.
    return FALSE;
  }

}
