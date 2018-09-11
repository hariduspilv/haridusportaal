<?php

namespace Drupal\openid_connect;

use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Extension\ModuleHandler;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class Claims.
 *
 * @package Drupal\openid_connect
 */
class Claims implements ContainerInjectionInterface {

  /**
   * Drupal\Core\Config\ConfigFactory definition.
   *
   * @var \Drupal\Core\Config\ConfigFactory
   */
  protected $configFactory;

  /**
   * Drupal\Core\Extension\ModuleHandler definition.
   *
   * @var \Drupal\Core\Extension\ModuleHandler
   */
  protected $moduleHandler;

  /**
   * The standard claims.
   *
   * @var array
   */
  protected $claims = [
    'name' => [
      'scope' => 'profile',
      'title' => 'Name',
      'type' => 'string',
      'description' => 'Full name',
    ],
    'given_name' => [
      'scope' => 'profile',
      'title' => 'Given name',
      'type' => 'string',
      'description' => 'Given name(s) or first name(s)',
    ],
    'family_name' => [
      'scope' => 'profile',
      'title' => 'Family name',
      'type' => 'string',
      'description' => 'Surname(s) or last name(s)',
    ],
    'middle_name' => [
      'scope' => 'profile',
      'title' => 'Middle name',
      'type' => 'string',
      'description' => 'Middle name(s)',
    ],
    'nickname' => [
      'scope' => 'profile',
      'title' => 'Nickname',
      'type' => 'string',
      'description' => 'Casual name',
    ],
    'preferred_username' => [
      'scope' => 'profile',
      'title' => 'Preferred username',
      'type' => 'string',
      'description' => 'Shorthand name by which the End-User wishes to be referred to',
    ],
    'profile' => [
      'scope' => 'profile',
      'title' => 'Profile',
      'type' => 'string',
      'description' => 'Profile page URL',
    ],
    'picture' => [
      'scope' => 'profile',
      'title' => 'Picture',
      'type' => 'string',
      'description' => 'Profile picture URL',
    ],
    'website' => [
      'scope' => 'profile',
      'title' => 'Website',
      'type' => 'string',
      'description' => 'Web page or blog URL',
    ],
    'email' => [
      'scope' => 'email',
      'title' => 'Email',
      'type' => 'string',
      'description' => 'Preferred e-mail address',
    ],
    'email_verified' => [
      'scope' => 'email',
      'title' => 'Email verified',
      'type' => 'boolean',
      'description' => 'True if the e-mail address has been verified; otherwise false',
    ],
    'gender' => [
      'scope' => 'profile',
      'title' => 'Gender',
      'type' => 'string',
      'description' => 'Gender',
    ],
    'birthdate' => [
      'scope' => 'profile',
      'title' => 'Birthdate',
      'type' => 'string',
      'description' => 'Birthday',
    ],
    'zoneinfo' => [
      'scope' => 'profile',
      'title' => 'Zoneinfo',
      'type' => 'string',
      'description' => 'Time zone',
    ],
    'locale' => [
      'scope' => 'profile',
      'title' => 'Locale',
      'type' => 'string',
      'description' => 'Locale',
    ],
    'phone_number' => [
      'scope' => 'phone',
      'title' => 'Phone number',
      'type' => 'string',
      'description' => 'Preferred telephone number',
    ],
    'phone_number_verified' => [
      'scope' => 'phone',
      'title' => 'Phone number verified',
      'type' => 'boolean',
      'description' => 'True if the phone number has been verified; otherwise false',
    ],
    'address' => [
      'scope' => 'address',
      'title' => 'Address',
      'type' => 'json',
      'description' => 'Preferred postal address',
    ],
    'updated_at' => [
      'scope' => 'profile',
      'title' => 'Updated at',
      'type' => 'number',
      'description' => 'Time the information was last updated',
    ],
  ];

  /**
   * The constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactory $config_factory
   *   The configuration factory.
   * @param \Drupal\Core\Extension\ModuleHandler $module_handler
   *   The module handler.
   */
  public function __construct(
      ConfigFactory $config_factory,
      ModuleHandler $module_handler
  ) {

    $this->configFactory = $config_factory;
    $this->moduleHandler = $module_handler;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('module_handler'),
      $container->get('config.factory')
    );
  }

  /**
   * Returns OpenID Connect claims.
   *
   * Allows them to be extended via an alter hook.
   *
   * @see http://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
   * @see http://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
   *
   * @return array
   *   List of claims
   */
  public function getClaims() {
    $claims = $this->claims;
    $this->moduleHandler->alter('openid_connect_claims', $claims);
    return $claims;
  }

  /**
   * Returns OpenID Connect standard Claims as a Form API options array.
   *
   * @return array
   *   List of claims as options
   */
  public function getOptions() {
    $options = [];
    foreach ($this->getClaims() as $claim_name => $claim) {
      $options[ucfirst($claim['scope'])][$claim_name] = $claim['title'];
    }
    return $options;
  }

  /**
   * Returns scopes that have to be requested based on the configured claims.
   *
   * @see http://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
   *
   * @return string
   *   Space delimited case sensitive list of ASCII scope values.
   */
  public function getScopes() {
    $claims = $this->configFactory
      ->getEditable('openid_connect.settings')
      ->get('userinfo_mappings');

    $scopes = ['openid', 'email'];
    $claims_info = Claims::getClaims();
    foreach ($claims as $claim) {
      if (isset($claims_info[$claim]) &&
          !isset($scopes[$claims_info[$claim]['scope']]) &&
          $claim != 'email') {

        $scopes[$claims_info[$claim]['scope']] = $claims_info[$claim]['scope'];
      }
    }
    return implode(' ', $scopes);
  }

}
