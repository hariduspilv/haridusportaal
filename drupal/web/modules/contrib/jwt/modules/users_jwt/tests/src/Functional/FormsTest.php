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
  protected static $modules = ['users_jwt', 'block'];

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
  protected function setUp(): void {
    parent::setUp();
    $this->drupalPlaceBlock('local_actions_block');
    $perms = ['administer site configuration', 'administer users'];
    $this->adminUser = $this->drupalCreateUser($perms);
    $this->user = $this->drupalCreateUser(['access content']);
    $this->drupalLogin($this->user);
  }

  /**
   * Tests that the JWT list and forms work as expected.
   */
  public function testForms() {
    // Loading another user's page should fail.
    $this->drupalGet(Url::fromRoute('users_jwt.key_list', ['user' => $this->adminUser->id()]));
    $this->assertSession()->statusCodeEquals(403);
    $this->drupalGet(Url::fromRoute('users_jwt.key_list', ['user' => $this->user->id()]));
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains('No keys found.');
    $this->clickLink('Generate Key');
    $this->assertSession()->pageTextContains('When you click the button, a new key will be generated');
    $this->submitForm([], 'Generate');
    // The test browser sees the response content.
    $generated_private_key = $this->getSession()->getPage()->getContent();
    self::assertNotFalse(\mb_strpos($generated_private_key, '-----BEGIN PRIVATE KEY-----'));
    $this->drupalGet(Url::fromRoute('users_jwt.key_list', ['user' => $this->user->id()]));
    $this->assertSession()->pageTextnotContains('No keys found.');
    $this->assertSession()->pageTextContains('-----BEGIN PUBLIC KEY-----');
    $expected_cache_tag = 'users_jwt:' . $this->user->id();
    $this->assertSession()->responseHeaderContains('X-Drupal-Cache-Tags', $expected_cache_tag);
    /** @var \Drupal\users_jwt\UsersJwtKeyRepositoryInterface $key_repository */
    $key_repository = $this->container->get('users_jwt.key_repository');
    $keys = $key_repository->getUsersKeys($this->user->id());
    self::assertCount(1, $keys);
    $generated_key = end($keys);
    // Sleep to make sure the time changes for the next key ID.
    sleep(1);
    $this->clickLink('Add Key');
    /** @var \Drupal\Core\Extension\ExtensionPathResolver $path_resolver */
    $path_resolver = $this->container->get('extension.path.resolver');
    $module_path = $path_resolver->getPath('module', 'users_jwt');
    $path = $module_path . '/tests/fixtures/users_jwt_rsa1-public.pem';
    $public_key = file_get_contents($path);
    $path = $module_path . '/tests/fixtures/users_jwt_rsa1-private.pem';
    $private_key1 = file_get_contents($path);
    $path = $module_path . '/tests/fixtures/users_jwt_rsa2-private.pem';
    $private_key2 = file_get_contents($path);
    $edit = [
      'pubkey' => $this->randomString(),
    ];
    $this->submitForm($edit, 'Save');
    $this->assertSession()->pageTextContains('This does not look like a PEM formatted RSA public key');
    $edit = [
      'pubkey' => $public_key,
    ];
    $this->submitForm($edit, 'Save');
    $keys = $key_repository->getUsersKeys($this->user->id());
    self::assertCount(2, $keys);
    unset($keys[$generated_key->id]);
    $submitted_key = end($keys);
    $this->drupalLogout();
    $this->drupalLogin($this->adminUser);
    // Allowed to access the normal user's keys page.
    $url = Url::fromRoute('users_jwt.key_list', ['user' => $this->user->id()]);
    $this->drupalGet($url);
    $this->assertSession()->statusCodeEquals(200);
    $this->drupalLogout();
    $variants = [
      'uid' => $this->user->id(),
      'uuid' => $this->user->uuid(),
      'name' => $this->user->getAccountName(),
    ];
    $extra = [
      'uid' => ['uuid', 'name'],
      'uuid' => ['name', 'anything'],
      'name' => ['something'],
    ];
    foreach ($variants as $id_type => $id_value) {
      $iat = \Drupal::time()->getRequestTime();
      $good_payload = [
        'iat' => $iat,
        'exp' => $iat + 1000,
        'drupal' => [
          $id_type => $id_value,
        ],
      ];
      // Verify requests work with the generated/submitted keys.
      foreach (['Authorization', 'JWT-Authorization'] as $header_name) {
        $url = Url::fromRoute('users_jwt.key_list', ['user' => $this->user->id()]);
        // When changing header name we need to reset the session.
        $this->getSession()->reset();
        $token = JWT::encode($good_payload, $generated_private_key, 'RS256', $generated_key->id);
        self::assertNotEmpty($token);
        $headers = [$header_name => 'UsersJwt ' . $token];
        $this->drupalGet($url, [], $headers);
        $this->assertSession()->statusCodeEquals(200);
        $token = JWT::encode($good_payload, $private_key1, 'RS256', $submitted_key->id);
        $headers = [$header_name => 'UsersJwt ' . $token];
        $this->drupalGet($url, [], $headers);
        $this->assertSession()->statusCodeEquals(200);
        // Add extra claims that should be ignored.
        $extra_payload = $good_payload;
        foreach ($extra[$id_type] as $key) {
          $extra_payload['drupal'][$key] = $this->randomMachineName();
        }
        $token = JWT::encode($extra_payload, $generated_private_key, 'RS256', $generated_key->id);
        $headers = [$header_name => 'UsersJwt ' . $token];
        $this->drupalGet($url, [], $headers);
        $this->assertSession()->statusCodeEquals(200);
        // Invalid key ID.
        $token = JWT::encode($good_payload, $private_key1, 'RS256', 'wxyz');
        $headers = [$header_name => 'UsersJwt ' . $token];
        $this->drupalGet($url, [], $headers);
        $this->assertSession()->statusCodeEquals(403);
        // Invalid private key.
        $token = JWT::encode($good_payload, $private_key2, 'RS256', $submitted_key->id);
        $headers = [$header_name => 'UsersJwt ' . $token];
        $this->drupalGet($url, [], $headers);
        $this->assertSession()->statusCodeEquals(403);
        // Invalid private key, public page.
        $token = JWT::encode($good_payload, $private_key2, 'RS256', $submitted_key->id);
        $headers = [$header_name => 'UsersJwt ' . $token];
        $this->drupalGet('<front>', [], $headers);
        $this->assertSession()->statusCodeEquals(200);
      }
    }
  }

}
