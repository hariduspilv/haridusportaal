<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Fields\Entity;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\metatag\MetatagManagerInterface;
use Drupal\metatag\MetatagToken;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Cmf\Component\Routing\RouteObjectInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\Route;

/**
 * Graphql field to retrieve entity metatags.
 *
 * @GraphQLField(
 *   secure = true,
 *   id = "entity_metatags",
 *   name = "entityMetatags",
 *   type = "[Metatag]",
 *   description = @Translation("Loads metatags for the entity."),
 *   parents = {"Entity"}
 * )
 */
class EntityMetatags extends FieldPluginBase implements ContainerFactoryPluginInterface {

  use DependencySerializationTrait;

  /**
   * The metatag manager service.
   *
   * @var \Drupal\metatag\MetatagManagerInterface
   */
  protected $metatagManager;

  /**
   * Metatag token.
   *
   * @var \Drupal\metatag\MetatagToken
   */
  protected $metatagToken;

  /**
   * Module Handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * Request context.
   *
   * @var \Symfony\Component\Routing\RequestContext
   */
  protected $requestContext;

  /**
   * Request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
    return new static(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $container->get('metatag.manager'),
      $container->get('metatag.token'),
      $container->get('module_handler'),
      $container->get('router.request_context'),
      $container->get('request_stack')
    );
  }

  /**
   * Metatags constructor.
   *
   * @param array $configuration
   *   The plugin configuration array.
   * @param string $pluginId
   *   The plugin id.
   * @param mixed $pluginDefinition
   *   The plugin definition array.
   * @param \Drupal\metatag\MetatagManagerInterface $metatagManager
   *   Metatag manager service.
   * @param \Drupal\metatag\MetatagToken $metatagToken
   *   Metatag token service.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler
   *   Module Handler.
   * @param \Symfony\Component\Routing\RequestContext $requestContext
   *   Request context.
   * @param \Symfony\Component\HttpFoundation\RequestStack $requestStack
   *   Request stack.
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    $pluginDefinition,
    MetatagManagerInterface $metatagManager,
    MetatagToken $metatagToken,
    ModuleHandlerInterface $moduleHandler,
    RequestContext $requestContext,
    RequestStack $requestStack
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->metatagManager = $metatagManager;
    $this->metatagToken = $metatagToken;
    $this->moduleHandler = $moduleHandler;
    $this->requestContext = $requestContext;
    $this->requestStack = $requestStack;
  }

  /**
   * {@inheritdoc}
   *
   * @throws \Drupal\Core\Entity\EntityMalformedException
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    if ($value instanceof ContentEntityInterface && !$value->isNew()) {
      $entity = $value;

      $this->changeRouteContext($entity);

      $tags = $this->metatagManager->tagsFromEntityWithDefaults($entity);

      $tags = $this->replaceTokens($tags, $entity);

      $metatagContext = [
        'entity' => &$entity,
        'graphql_context' => $context,
      ];
      $this->moduleHandler->alter('metatags', $tags, $metatagContext);

      $elements = $this->metatagManager->generateRawElements($tags, $entity);

      $elements = array_filter($elements, function ($metatag_object) {
        return !NestedArray::getValue($metatag_object, [
          '#attributes',
          SCHEMA_METATAG_MODULE_NAME,
        ]);
      });

      $this->revertRouteContext();

      foreach ($elements as $element) {
        yield $element;
      }
    }
    else {
      yield NULL;
    }
  }

  /**
   * Replace tokens.
   *
   * @param array $tags
   *   Metatags tags.
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   Content entity.
   *
   * @return array
   *   Metatags tags replaced.
   */
  protected function replaceTokens(array $tags, ContentEntityInterface $entity): array {
    $data = [$entity->getEntityTypeId() => $entity];
    $options = [
      'langcode' => $entity->language()->getId(),
      'entity' => $entity,
    ];

    foreach ($tags as $index => $tag) {
      $tags[$index] = $this->metatagToken->replace($tag, $data, $options);
    }

    return $tags;
  }

  /**
   * Change context route.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The entity.
   *
   * @throws \Drupal\Core\Entity\EntityMalformedException
   */
  protected function changeRouteContext(ContentEntityInterface $entity): void {
    if ($this->routingNeedsToBeChanged()) {
      $host = $this->requestStack->getCurrentRequest()->getSchemeAndHttpHost();
      $uri = $entity->toUrl()->toString();
      $request = Request::create($host . $uri);
      $request->attributes->set(
        RouteObjectInterface::ROUTE_NAME,
        'entity.node.canonical'
      );
      $request->attributes->set(
        RouteObjectInterface::ROUTE_OBJECT,
        new Route($uri)
      );
      $this->requestStack->push($request);
      $this->requestContext->fromRequest($request);
      $this->requestContext->setParameter('node', $entity->id());
    }
  }

  /**
   * Revert to previous request.
   */
  protected function revertRouteContext(): void {
    if ($this->routingNeedsToBeChanged()) {
      $this->requestStack->pop();
    }
  }

  /**
   * Tells it is necessary to change the routing.
   *
   * @return bool
   *   True if it is necessary to change the routing system.
   */
  protected function routingNeedsToBeChanged(): bool {
    return PHP_SAPI === 'cli';
  }

}
