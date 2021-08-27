<?php

namespace Drupal\Tests\jwt\Functional;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Tests for jwt authentication provider.
 *
 * @see \Drupal\Tests\basic_auth\Functional\BasicAuthTest
 *
 * @group jwt
 */
class JwtAuthTest extends BrowserTestBase {

  /**
   * Modules installed for all tests.
   *
   * @var array
   */
  public static $modules = [
    'system',
    'user',
    'router_test',
    'key',
    'jwt',
    'jwt_auth_issuer',
    'jwt_auth_consumer',
    'jwt_test',
  ];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Test jwt authentication.
   */
  public function testJwtAuth() {
    // Enable page caching.
    $config = $this->config('system.performance');
    $config->set('cache.page.max_age', 300);
    $config->save();

    $account = $this->drupalCreateUser(['access content']);
    /** @var \Drupal\jwt\Transcoder\JwtTranscoderInterface $transcoder */
    $transcoder = $this->container->get('jwt.transcoder');
    $this->setCurrentUser($account);
    /** @var \Drupal\jwt\Authentication\Provider\JwtAuth $auth */
    $auth = $this->container->get('jwt.authentication.jwt');
    $token = $auth->generateToken();
    $decoded_jwt = $transcoder->decode($token);
    $this->assertEqual($account->id(), $decoded_jwt->getClaim(['drupal', 'uid']));
    foreach (['jwt_test.11.1', 'jwt_test.11.2'] as $route_name) {
      $url = Url::fromRoute($route_name);
      foreach (['Authorization', 'JWT-Authorization'] as $header_name) {
        $headers = [
          $header_name => 'Bearer ' . $token,
        ];
        $this->drupalGet($url, [], $headers);
        $this->assertSession()->statusCodeEquals(200);
        $this->assertSession()->pageTextContains($account->getAccountName());
        self::assertNull($this->drupalGetHeader('X-Drupal-Cache'));
        self::assertFalse(strpos($this->drupalGetHeader('Cache-Control'), 'public'), 'Cache-Control is not set to public');
        $account->block()->save();
        $this->drupalGet($url, [], $headers);
        $this->assertSession()->statusCodeEquals(403);
        $account->activate()->save();
        // This is needed to prevent the Authorization header from the last loop
        // being sent again by the mink session.
        $this->mink->resetSessions();
        $headers = [
          $header_name => 'Bearer ' . $this->randomMachineName(),
        ];
        $this->drupalGet($url, [], $headers);
        // Bad jwt token does not authenticate the user.
        $this->assertSession()->pageTextNotContains($account->getAccountName());
        $this->assertSession()->statusCodeEquals(403);
        $this->mink->resetSessions();
      }
    }
    // The front page should return a 200 even for an invalid JWT.
    foreach (['Authorization', 'JWT-Authorization'] as $header_name) {
      $headers = [
        $header_name => 'Bearer ' . $this->randomMachineName(),
      ];
      $this->drupalGet('<front>', [], $headers);
      // Bad jwt token does not authenticate the user.
      $this->assertSession()->pageTextNotContains($account->getAccountName());
      $this->assertSession()->statusCodeEquals(200);
      $this->mink->resetSessions();
    }
    // Ensure that pages already in the page cache aren't returned from page
    // cache if jwt credentials are provided.
    $url = Url::fromRoute('jwt_test.10');
    $this->drupalGet($url);
    $this->assertEqual($this->drupalGetHeader('X-Drupal-Cache'), 'MISS');
    $this->drupalGet($url);
    $this->assertEqual($this->drupalGetHeader('X-Drupal-Cache'), 'HIT');
    foreach (['Authorization', 'JWT-Authorization'] as $header_name) {
      $headers = [
        $header_name => 'Bearer ' . $token,
      ];
      $this->drupalGet($url, [], $headers);
      $this->assertSession()->statusCodeEquals(200);
      $this->assertNull($this->drupalGetHeader('X-Drupal-Cache'));
      $this->assertFalse(strpos($this->drupalGetHeader('Cache-Control'), 'public'), 'No page cache response when requesting a cached page with jwt credentials.');
      // This is needed to prevent the Authorization header from the last loop
      // being sent again by the mink session.
      $this->mink->resetSessions();
    }
    // Verify the fallback header can be used in combination with basic_auth.
    $modules = ['basic_auth'];
    $success = $this->container->get('module_installer')->install($modules, TRUE);
    $this->assertTrue($success, new FormattableMarkup('Enabled modules: %modules', ['%modules' => implode(', ', $modules)]));
    $username = $account->getAccountName();
    $password = $account->pass_raw;
    $url = Url::fromRoute('jwt_test.11.2');
    $headers = ['Authorization' => 'Basic ' . base64_encode("$username:$password")];
    $this->drupalGet($url, [], $headers);
    $this->assertSession()->statusCodeEquals(200);
    // Account name is displayed.
    $this->assertSession()->pageTextContains($account->getAccountName());
    $this->mink->resetSessions();
    // This simulates a site where the basic auth is validated by the
    // webserver or shield module or otherwise is not valid as a user login.
    $headers = ['Authorization' => 'Basic ' . $this->randomMachineName()];
    $this->drupalGet($url, [], $headers);
    // The response seems to vary between 401 and 403, either is fine.
    $code = (int) $this->getSession()->getStatusCode();
    $this->assertTrue(in_array($code, [401, 403], TRUE), 'Access is not granted.');
    $this->mink->resetSessions();
    $headers += ['JWT-Authorization' => 'Bearer ' . $token];
    $this->drupalGet($url, [], $headers);
    $this->assertSession()->statusCodeEquals(200);
    // Account name is displayed.
    $this->assertSession()->pageTextContains($account->getAccountName());
  }

}
