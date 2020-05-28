<?php

namespace Drupal\jwt_path_auth\Authentication\Provider;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\PageCache\ResponsePolicy\KillSwitch;
use Drupal\jwt\Transcoder\JwtTranscoderInterface;
use Drupal\jwt\Transcoder\JwtDecodeException;
use Drupal\Core\Authentication\AuthenticationProviderInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * JWT Authentication Provider.
 */
class JwtPathAuth implements AuthenticationProviderInterface {

  /**
   * The JWT Transcoder service.
   *
   * @var \Drupal\jwt\Transcoder\JwtTranscoderInterface
   */
  protected $transcoder;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The kill switch.
   *
   * @var \Drupal\Core\PageCache\ResponsePolicy\KillSwitch
   */
  protected $killSwitch;

  /**
   * Constructs a HTTP basic authentication provider object.
   *
   * @param \Drupal\jwt\Transcoder\JwtTranscoderInterface $transcoder
   *   The jwt transcoder service.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity manager service.
   * @param \Drupal\Core\PageCache\ResponsePolicy\KillSwitch $killSwitch
   *   The kill switch.
   */
  public function __construct(
    JwtTranscoderInterface $transcoder,
    ConfigFactoryInterface $config_factory,
    EntityTypeManagerInterface $entity_type_manager,
    KillSwitch $killSwitch
  ) {
    $this->transcoder = $transcoder;
    $this->configFactory = $config_factory;
    $this->entityTypeManager = $entity_type_manager;
    $this->killSwitch = $killSwitch;
  }

  /**
   * {@inheritdoc}
   */
  public function applies(Request $request) {
    $raw_jwt = $request->query->get('jwt');
    if (empty($raw_jwt)) {
      return FALSE;
    }
    $config = $this->configFactory->get('jwt_path_auth.config');
    $allowed_path_prefixes = (array) $config->get('allowed_path_prefixes');
    $path_matched = FALSE;
    $request_path = $request->getPathInfo();
    foreach ($allowed_path_prefixes as $prefix) {
      if (strpos($request_path, $prefix) === 0) {
        $path_matched = TRUE;
        break;
      }
    }
    return $path_matched;
  }

  /**
   * {@inheritdoc}
   */
  public function authenticate(Request $request) {
    $raw_jwt = $request->query->get('jwt');

    // Decode JWT and validate signature.
    try {
      $jwt = $this->transcoder->decode($raw_jwt);
    }
    catch (JwtDecodeException $e) {
      return NULL;
    }
    $uid = $jwt->getClaim(['drupal', 'path_auth', 'uid']);
    // The JWT must include a claim matching the path after the host name,
    // or a prefix of the path.  E.g. "/system/files/". Note that this
    // must include any base path if the site is in a subdirectory.
    $path = $jwt->getClaim(['drupal', 'path_auth', 'path']);
    $request_path = $request->getBaseUrl() . $request->getPathInfo();
    if ($uid && $path && strpos($request_path, $path) === 0) {
      $user = $this->entityTypeManager->getStorage('user')->load($uid);
      if ($user && !$user->isBlocked()) {
        // Mark this page as being uncacheable.
        $this->killSwitch->trigger();
        return $user;
      }
    }
    return NULL;
  }

}
