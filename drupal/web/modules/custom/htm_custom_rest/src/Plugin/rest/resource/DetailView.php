<?php

namespace Drupal\htm_custom_rest\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\Core\Entity\EntityDisplayRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\decoupled_kit\Controller\DecoupledHelperController;
use Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Fields\ElasticQuery\ElasticQuery;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Drupal\file\Entity\File;
use Drupal\image\Entity\ImageStyle;

use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;


/**
 * Represents Product list rest records as resources.
 *
 * @RestResource (
 *   id = "htm_custom_rest_detail_view",
 *   label = @Translation("HTM Entity detail view rest"),
 *   uri_paths = {
 *     "canonical" = "/api/detailview",
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
class DetailView extends ResourceBase {

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;
  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  private $entityDisplayRepository;
  private EntityTypeManagerInterface $entityTypeManager;
  private $entityTypemanager;

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
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Entity type manager.
   * @param \Drupal\Core\Database\Connection $database
   *   Database connection.
   * @param \Drupal\decoupled_kit\Controller\DecoupledHelperController
   *   Decoupled kit controller.
   */
  public function __construct(
    array $configuration,
          $plugin_id,
          $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    LanguageManagerInterface $languageManager,
    EntityTypeManagerInterface $entityTypeManager,
    Connection $database,
    EntityDisplayRepositoryInterface $entityDisplayRepository,
    DecoupledHelperController $decoupledKit,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->currentUser = $current_user;
    $this->languageManager = $languageManager;
    $this->entityTypeManager = $entityTypeManager;
    $this->db = $database;
    $this->entityDisplayRepository = $entityDisplayRepository;
    $this->decoupledKit = $decoupledKit;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('graphql_custom_translation'),
      $container->get('current_user'),
      $container->get('language_manager'),
      $container->get('entity_type.manager'),
      $container->get('database'),
      $container->get('entity_display.repository'),
      $container->get('decoupled_kit')

    );
  }
  /**
   * Responds to GET requests.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return ResourceResponse
   *   The response containing the record.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   */
  public function get(Request $request) {
    // Set default range if not provided.
    $params = $request->query->all();
    if (empty($params['path'])) {

    }
    // We can skip the check because it has to be set.
    $path = $params['path'];
    $entity = $this->decoupledKit->getEntityFromPath($path);
    $view_service = \Drupal::service('htm_custom_rest.fieldsAndViews');
    $info = $view_service->entryFunctionSingle($request, $entity, $path);
    $cachable_response = new CacheableResponse(json_encode($info));
    $cachable_response->addCacheableDependency($params);
//    $cachable_response = new ResourceResponse($returnable_values);
    return $cachable_response;
  }
}
