<?php

namespace Drupal\Tests\users_jwt\Functional;

use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;
use Firebase\JWT\JWT;

/**
 * Simple test to ensure that user pages and forms work.
 *
 * @group users_jwt
 */
class FormsTest extends BrowserTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['users_jwt', 'block'];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * A user with permission to administer users.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $adminUser;

  /**
   * A user with no special perissions.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $user;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->drupalPlaceBlock('local_actions_block');
    $this->adminUser = $this->drupalCreateUser(['administer site configuration', 'administer users']);
    $this->user = $this->drupalCreateUser(['access content']);
    $this->drupalLogin($this->user);
  }

  /**
   * Tests that the JWT list and forms work as expected.
   */
  public function testForms() {
    // Loading another user's page should fail.
    $this->drupalGet(Url::fromRoute('users_jwt.key_list', ['user' => $this->adminUser->id()]));
    $this->assertResponse(403);
    $this->drupalGet(Url::fromRoute('users_jwt.key_list', ['user' => $this->user->id()]));
    $this->assertResponse(200);
    $this->assertText('No keys found.');
    $this->clickLink('Generate Key');
    $this->assertText('When you click the button, a new key will be generated');
    $this->submitForm([], 'Generate');
    // The test browser sees the response content.
    $generated_private_key = $this->getSession()->getPage()->getContent();
    $this->assertContains('-----BEGIN PRIVATE KEY-----', $generated_private_key);
    $this->drupalGet(Url::fromRoute('users_jwt.key_list', ['user' => $this->user->id()]));
    $this->assertNoText('No keys found.');
    $this->assertText('-----BEGIN PUBLIC KEY-----');
    $this->assertCacheTag('users_jwt:' . $this->user->id());
    /** @var \Drupal\users_jwt\UsersJwtKeyRepositoryInterface $key_repository */
    $key_repository = $this->container->get('users_jwt.key_repository');
    $keys = $key_repository->getUsersKeys($this->user->id());
    $this->assertCount(1, $keys);
    $generated_key = end($keys);
    $this->clickLink('Add Key');
    $path = drupal_get_path('module', 'users_jwt') . '/tests/fixtures/users_jwt_rsa1-public.pem';
    $public_key = file_get_contents($path);
    $path = drupal_get_path('module', 'users_jwt') . '/tests/fixtures/users_jwt_rsa1-private.pem';
    $private_key1 = file_get_contents($path);
    $path = drupal_get_path('module', 'users_jwt') . '/tests/fixtures/users_jwt_rsa2-private.pem';
    $private_key2 = file_get_contents($path);
    $edit = [
      'pubkey' => $this->randomString(),
    ];
    $this->submitForm($edit, 'Save');
    $this->assertText('This does not look like a PEM formatted RSA public key');
    $edit = [
      'pubkey' => $public_key,
    ];
    $this->submitForm($edit, 'Save');
    $keys = $key_repository->getUsersKeys($this->user->id());
    $this->assertCount(2, $keys);
    unset($keys[$generated_key->id]);
    $submitted_key = end($keys);
    $this->drupalLogout();
    $this->drupalLogin($this->adminUser);
    // Allowed to access the normal user's keys page.
    $url = Url::fromRoute('users_jwt.key_list', ['user' => $this->user->id()]);
    $this->drupalGet($url);
    $this->assertResponse(200);
    $this->drupalLogout();
    $iat = \Drupal::time()->getCurrentTime();
    $good_payload = [
      'iat' => $iat,
      'exp' => $iat + 1000,
      'drupal' => [
        'uid' => $this->user->id(),
      ],
    ];
    // Verify requests work with the generated/submitted keys.
    foreach (['Authorization', 'JWT-Authorization'] as $header_name) {
      $url = Url::fromRoute('users_jwt.key_list', ['user' => $this->user->id()]);
      // When changing header name we need to reset the session.
      $this->getSession()->reset();
      $token = JWT::encode($good_payload, $generated_private_key, 'RS256', $generated_key->id);
      $this->assertNotEmpty($token);
      $headers = [$header_name => 'UsersJwt ' . $token];
      $this->drupalGet($url, [], $headers);
      $this->assertResponse(200);
      $token = JWT::encode($good_payload, $private_key1, 'RS256', $submitted_key->id);
      $headers = [$header_name => 'UsersJwt ' . $token];
      $this->drupalGet($url, [], $headers);
      $this->assertResponse(200);
      // Invalid key ID.
      $token = JWT::encode($good_payload, $private_key1, 'RS256', 'wxyz');
      $headers = [$header_name => 'UsersJwt ' . $token];
      $this->drupalGet($url, [], $headers);
      $this->assertResponse(403);
      // Invalid private key.
      $token = JWT::encode($good_payload, $private_key2, 'RS256', $submitted_key->id);
      $headers = [$header_name => 'UsersJwt ' . $token];
      $this->drupalGet($url, [], $headers);
      $this->assertResponse(403);
    }
  }

}
