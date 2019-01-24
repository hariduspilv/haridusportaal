<?php

namespace Drupal\seckit\Tests;

use Drupal\simpletest\WebTestBase;

/**
 * Functional tests for Security Kit.
 *
 * @group seckit
 */
class SecKitCSPCaseTest extends WebTestBase {

  /**
   * Admin user for tests.
   *
   * @var object
   */
  private $admin;

  /**
   * Path for the reporting route.
   *
   * @var string
   */
  private $reportPath;

  /**
   * List of modules to enable.
   *
   * @var array
   */
  public static $modules = ['seckit'];

  /**
   * Implements getInfo().
   *
   * @see DrupalWebTestCase::getInfo()
   */
  public static function getInfo() {
    return [
      'name' => t('Security Kit CSP functionality'),
      'description' => t('Tests CSP functionality and settings page of Security Kit module.'),
      'group' => t('Security Kit'),
    ];
  }

  /**
   * Implements setUp().
   *
   * @see DrupalWebTestCase::setUp()
   */
  public function setUp() {
    parent::setUp();
    $this->admin = $this->drupalCreateUser(['administer seckit']);
    $this->drupalLogin($this->admin);

    $route_provider = \Drupal::service('router.route_provider');
    $route = $route_provider->getRouteByName('seckit.report');
    // Need to remove trailing slash so it is not escapted in string.
    $path = $route->getPath();
    $this->reportPath = ltrim($path, '/');
  }

  /**
   * Tests Content Security Policy with all enabled directives.
   */
  public function testCspHasAllDirectives() {
    $form = [
      'seckit_xss[csp][checkbox]' => TRUE,
      'seckit_xss[csp][default-src]' => '*',
      'seckit_xss[csp][script-src]' => '*',
      'seckit_xss[csp][object-src]' => '*',
      'seckit_xss[csp][style-src]' => '*',
      'seckit_xss[csp][img-src]' => '*',
      'seckit_xss[csp][media-src]' => '*',
      'seckit_xss[csp][frame-src]' => '*',
      'seckit_xss[csp][frame-ancestors]' => '*',
      'seckit_xss[csp][child-src]' => '*',
      'seckit_xss[csp][font-src]' => '*',
      'seckit_xss[csp][connect-src]' => '*',
      'seckit_xss[csp][report-uri]' => $this->reportPath,
    ];
    $this->drupalPostForm('admin/config/system/seckit', $form, t('Save configuration'));
    $expected = 'default-src *; script-src *; object-src *; style-src *; img-src *; media-src *; frame-src *; frame-ancestors *; child-src *; font-src *; connect-src *; report-uri ' . base_path() . $this->reportPath;
    $this->assertEqual($expected, $this->drupalGetHeader('Content-Security-Policy'), t('Content-Security-Policy has all the directves (Official).'));
    $this->assertEqual($expected, $this->drupalGetHeader('X-Content-Security-Policy'), t('X-Content-Security-Policy has all the directves (Mozilla and IE10).'));
    $this->assertEqual($expected, $this->drupalGetHeader('X-WebKit-CSP'), t('X-WebKit-CSP has all the directves (Chrome and Safari).'));
  }

  /**
   * Tests Content Security Policy with policy-uri directive.
   *
   * In this case, only policy-uri directive should be present.
   */
  /*
  public function testCSPPolicyUriDirectiveOnly() {
  $form = array(
  'seckit_xss[csp][checkbox]'    => TRUE,
  'seckit_xss[csp][default-src]' => '*',
  'seckit_xss[csp][script-src]'  => '*',
  'seckit_xss[csp][object-src]'  => '*',
  'seckit_xss[csp][style-src]'   => '*',
  'seckit_xss[csp][img-src]'     => '*',
  'seckit_xss[csp][media-src]'   => '*',
  'seckit_xss[csp][frame-src]'   => '*',
  'seckit_xss[csp][child-src]'   => '*',
  'seckit_xss[csp][font-src]'    => '*',
  'seckit_xss[csp][connect-src]' => '*',
  'seckit_xss[csp][report-uri]'  => SECKIT_CSP_REPORT_URL,
  'seckit_xss[csp][policy-uri]'  => 'http://mysite.com/csp.xml',
  );
  $this->drupalPostForm('admin/config/system/seckit',
  $form, t('Save configuration'));
  $expected = 'policy-uri http://mysite.com/csp.xml';
  $this->assertEqual($expected,
  $this->drupalGetHeader('Content-Security-Policy'),
  t('Content-Security-Policy has only policy-uri (Official).'));
  $this->assertEqual($expected,
  $this->drupalGetHeader('X-Content-Security-Policy'),
  t('X-Content-Security-Policy has only policy-uri (Mozilla and IE10).'));
  $this->assertEqual($expected, $this->drupalGetHeader('X-WebKit-CSP'),
  t('X-WebKit-CSP has only policy-uri(Chrome and Safari).'));
  }
   */

  /**
   * Tests Content Security Policy with all directives empty.
   *
   * In this case, we should revert back to default values.
   */
  public function testCspAllDirectivesEmpty() {
    $form = [
      'seckit_xss[csp][checkbox]' => TRUE,
      'seckit_xss[csp][default-src]' => 'self',
      'seckit_xss[csp][script-src]' => '',
      'seckit_xss[csp][object-src]' => '',
      'seckit_xss[csp][img-src]' => '',
      'seckit_xss[csp][media-src]' => '',
      'seckit_xss[csp][style-src]' => '',
      'seckit_xss[csp][frame-src]' => '',
      'seckit_xss[csp][frame-ancestors]' => '',
      'seckit_xss[csp][child-src]' => '',
      'seckit_xss[csp][font-src]' => '',
      'seckit_xss[csp][connect-src]' => '',
      'seckit_xss[csp][report-uri]' => $this->reportPath,
      'seckit_xss[csp][policy-uri]' => '',
    ];
    $this->drupalPostForm('admin/config/system/seckit', $form, t('Save configuration'));
    $expected = "default-src self; report-uri " . base_path() . $this->reportPath;
    $this->assertEqual($expected, $this->drupalGetHeader('Content-Security-Policy'), t('Content-Security-Policy has default directive (Official).'));
    $this->assertEqual($expected, $this->drupalGetHeader('X-Content-Security-Policy'), t('X-Content-Security-Policy has default directive (Mozilla and IE10).'));
    $this->assertEqual($expected, $this->drupalGetHeader('X-WebKit-CSP'), t('X-WebKit-CSP has default directive (Chrome and Safari).'));
  }

}
