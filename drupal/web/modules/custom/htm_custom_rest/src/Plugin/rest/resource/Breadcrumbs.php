<?php

namespace Drupal\htm_custom_rest\Plugin\rest\resource;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Menu\MenuLinkTree;
use Drupal\Core\Menu\MenuLinkTreeElement;
use Drupal\Core\Url;
use Drupal\decoupled_kit\Controller\DecoupledHelperController;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\views\Views;
use Psr\Log\LoggerInterface;
use Drupal\decoupled_router\Controller\PathTranslator;
use Drupal\rest\ResourceResponse;
use Psr\Container\ContainerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Represents Product list rest records as resources.
 *
 * @RestResource (
 *   id = "htm_custom_rest_breadcrumbs",
 *   label = @Translation("HTM Custom breadcrumbs"),
 *   uri_paths = {
 *     "canonical" = "/api/breadcrumbs",
 *   }
 * )
 *
 * @DCG
 * This plugin exposes database records as REST resources. In order to enable it
 * import the resource configuration into active configuration storage. You may
 * find an example of such configuration in the following file:
 * core/modules/rest/config/optional/rest.resource.entity.node.yml.
 * Alternatively you can make use of REST UI module.
 * @see https://www.drupal.org/project/restui
 * For accessing Drupal entities through REST interface use
 * \Drupal\rest\Plugin\rest\resource\EntityResource plugin.
 */
class Breadcrumbs extends ResourceBase {

  /**
   * The available serialization formats.
   *
   * @var array
   */
  protected $serializerFormats = [];

  /**
   * A logger instance.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  protected $container;

  /**
   * @var \Symfony\Component\EventDispatcher\EventDispatcherInterface
   */
  private EventDispatcherInterface $eventDispatcher;
  /**
   * @var \Symfony\Component\HttpKernel\HttpKernelInterface
   */
  private HttpKernelInterface $httpKernel;
  private $pathAliasManager;

  /**
   * Constructs a new BaseSettingsRestResource object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Entity type manager.
   */
  public function __construct(
    array $configuration,
          $plugin_id,
          $plugin_definition,
    array $serializer_formats,
    LanguageManagerInterface $languageManager,
    EntityTypeManagerInterface $entityTypeManager,
    LoggerInterface $logger,
    EventDispatcherInterface $event_dispatcher,
    HttpKernelInterface $http_kernel,
    ContainerInterface $container,
    AliasManagerInterface $aliasManager,
    DecoupledHelperController $decoupledHelperController,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats,$logger);

    $this->languageManager = $languageManager;
    $this->entityTypeManager = $entityTypeManager;
    $this->logger = $logger;
    $this->eventDispatcher = $event_dispatcher;
    $this->httpKernel = $http_kernel;
    $this->container = $container;
    $this->pathAliasManager = $aliasManager;
    $this->decoupledKit = $decoupledHelperController;

  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface|\Symfony\Component\DependencyInjection\ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('language_manager'),
      $container->get('entity_type.manager'),
      $container->get('logger.factory')->get('rest'),
      $container->get('event_dispatcher'),
      $container->get('http_kernel'),
      $container->get('service_container'),
      $container->get('path_alias.manager'),
      $container->get('decoupled_kit')

    );
  }
  /**
   * Check request path.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   User request.
   * @param bool $needCanonicalUrl
   *   Need call canonicalPath().
   *
   * @return string
   *   Checked path or exception if empty.
   */
  public function checkPath(Request $request, $needCanonicalUrl = TRUE) {
    $path = $request->query->get('path');
    if (empty($path)) {
      throw new NotFoundHttpException('Unable to work with empty path. Please send a ?path query string parameter with your request.');
    }

    if ($needCanonicalUrl) {
      $path = $this->canonicalPath($path);
    }
    return $path;
  }

  /**
   * Canonical path.
   *
   * @param string $path
   *   Input path.
   * @param bool $url_path_only
   *   Only path part of url.
   *
   * @return string
   *   Canonical path.
   */
  public function canonicalPath($path, $url_path_only = TRUE) {
    $path = mb_strtolower(trim($path));
    if ($url_path_only) {
      $path = parse_url($path, PHP_URL_PATH);
    }
    return sprintf('/%s', ltrim($path, '/'));
  }
  public function get(Request $request) {
    $parameters = $request->query->all();
    $config = \Drupal::config('decoupled_kit_breadcrumb.config');
    if (empty($parameters['path'])) {
      $data = [
        'error' => TRUE,
        'message' => t('Path is not included'),
      ];
      $response = new ResourceResponse($data);
      $response->addCacheableDependency($request);
      return $response;
    }
    $data = [];
    $path_parts= explode('/',$parameters['path']);
    $path = $this->checkPath($request);
    dump($path);
    $get_path_info = new PathTranslator($this->eventDispatcher, $this->httpKernel);
    $info = $get_path_info->translate($request)->getContent();
    $info = json_decode($info);
    if (count($path_parts)==1) {
      $data['links'] = [];
      $data['links']= [
       [
          'path' => '/',
          'label' => t('Home page'),
        ],
        [
          'path' => $request->get('path'),
          'label' => $info->label,
        ],
      ];
    }
    else{
      $menu_tree_service = \Drupal::service('menu.link_tree');
      $parameters = $menu_tree_service->getCurrentRouteMenuTreeParameters('main');
      $tree = \Drupal::menuTree()->load('main', new \Drupal\Core\Menu\MenuTreeParameters());
      $link_tree = [];
      $this->menuTreeGetLinks($tree, $info->label, $link_tree);
      dump($link_tree);
    }
    $response = new ResourceResponse($data);
    $response->addCacheableDependency($request);
    return $response;

  }
  /**
   * Recursively find parents of a given menu link.
   */
  private function menuTreeGetLinks(array $tree, $link_title, array &$link_tree) {
    foreach ($tree as $key => $data) {
      dump($data->link->getTitle());
      dump($link_title);
      if ($data->link->getTitle() == $link_title) {
        // Return the parents for this link.

      }
      if ($data->hasChildren) {
        $result = $this->menuTreeGetLinks($data->subtree, $link_title, $menu_tree_service);
        if (!empty($result)) {
          return $result;
        }
      }
    }
    return [];
  }
/**
 * Get breadcrumb title.
 *
 * @param string $path
 *   Input path.
 * @param array $path_patterns
 *   Patterns from config.
 *
 * @return string|bool
 *   Title string or null.
 */
protected function getTitle($path, array $path_patterns) {
  $internal_path = $this->pathAliasManager->getPathByAlias($path);
  if ($internal_path && $internal_path != $path) {
    $entity = $this->decoupledKit->getEntityFromPath($internal_path);
    if (!empty($entity)) {
      $title = NULL;
      $entity_type = $entity->getEntityTypeId();
      switch ($entity_type) {
        case 'taxonomy_term':
          $title = $entity->getName();
          break;

        case 'node':
          $title = $entity->getTitle();

        default:
          try {
            $title = $entity->getTitle();
          }
          catch (\Exception $e) {
            return NULL;
          }
      }

      if (!$title) {
        return NULL;
      }
      return $title;
    }
  }
  else {
    if (!empty($path_patterns)) {
      // Get title from path patterns.
      foreach ($path_patterns as $value) {
        [, $link, $title] = explode('|', $value);
        $link = $this->decoupledKit->canonicalPath($link);

        if ($path == $link) {
          return trim($title);
        }
      }
    }
  }

  return NULL;
}

/**
 * Get main part.
 *
 * @param string $path
 *   Input path.
 * @param array $path_patterns
 *   Patterns from config.
 * @param bool $use_entity_bundle
 *   Patterns from config.
 *
 * @return array|bool
 *   Main part of breadcrumb or NULL.
 */
protected function getBreadcrumbs($path, array $path_patterns, $use_entity_bundle) {
  $parts = explode('/', $path);

  // Remove first and last elements.
  array_shift($parts);
  array_pop($parts);

  $internal_path = $this->pathAliasManager->getPathByAlias($path);
  $entity = $this->decoupledKit->getEntityFromPath($internal_path);

  // Add entity bundle name if url is a simple.
  if ($use_entity_bundle && empty($parts) && !empty($entity)) {
    $entity_bundle = $entity->bundle();
    if (!empty($entity_bundle)) {
      $parts[] = $entity_bundle;
    }
  }

  if (empty($parts)) {
    return NULL;
  }

  $res = [];

  // Breadcrumbs from routes.
  $parts2 = [];
  foreach ($parts as $part) {
    $parts2[] = $part;
    $url = '/' . implode('/', $parts2);
    $title = $this->getTitleFromPath($url);
    if (!empty($title)) {
      $res[$part] = [
        'link' => $url,
        'title' => $title,
      ];
    }
  }

  // Breadcrumbs from path patterns settings.
  foreach ($parts as $part) {
    if (!empty($path_patterns)) {
      foreach ($path_patterns as $pattern) {
        [$type, $link, $title] = explode('|', $pattern);
        if (trim($type) == $part) {
          $res[$part] = [
            'link' => $this->decoupledKit->canonicalPath($link),
            'title' => trim($title),
          ];
          break;
        }
      }
    }
  }

  // Breadcrumbs from bundle title.
  if ($use_entity_bundle && empty($res) && !empty($entity)) {
    $entity_bundle = $entity->bundle();
    if (!empty($entity_bundle)) {
      $entity_bundle_title = $entity->type->entity->label();
      $res[] = [
        'link' => $this->decoupledKit->canonicalPath($entity_bundle),
        'title' => $entity_bundle_title,
      ];
    }
  }

  return $res;
}

/**
 * Get title from path.
 *
 * @param string $path
 *   Input path.
 *
 * @return string|bool
 *   Title string.
 */
protected function getTitleFromPath($path) {
  try {
    $routeName = Url::fromUri("internal:" . $path)->getRouteName();
  }
  catch (\Exception $e) {
    return NULL;
  }

  $title = NULL;
  $routeParts = explode('.', $routeName);
  switch ($routeParts[0]) {
    case 'entity':
      $title = $this->getTitle($path, []);
      break;

    case 'view':
      $viewName = $routeParts[1];
      $displayId = $routeParts[2];
      $view = Views::getView($viewName);
      if (!$view || !$view->access($displayId)) {
        return NULL;
      }
      $view->setDisplay($displayId);
      $title = $view->getTitle();
      break;
  }

  return $title;
}

/**
 * Check for valid links.
 *
 * @param array $breadcrumbs
 *   Breadcrumbs array.
 *
 * @return array
 *   Breadcrumbs array with valid links.
 */
protected function checkLinks(array $breadcrumbs) {
  $res = [];
  foreach ($breadcrumbs as $breadcrumb) {
    $link = $breadcrumb['link'] ?? NULL;
    if (empty($link) || $this->pathValidator->isValid($link)) {
      $res[] = $breadcrumb;
    }
  }
  return $res;
}
}
