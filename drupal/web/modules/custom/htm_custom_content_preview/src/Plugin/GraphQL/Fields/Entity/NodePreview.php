<?php

namespace Drupal\htm_custom_content_preview\Plugin\GraphQL\Fields\Entity;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\TypedData\TranslatableInterface;
use Drupal\graphql\GraphQL\Buffers\EntityBuffer;
use Drupal\graphql\GraphQL\Cache\CacheableValue;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GraphQL\Type\Definition\ResolveInfo;
use Drupal\Core\TempStore\PrivateTempStoreFactory;

/**
 * @GraphQLField(
 *   id = "custom_nodepreview_by_id",
 *   name = "NodePreviewByUuid",
 *   secure = true,
 *   type = "Entity",
 *   arguments = {
 *     "uuid" = "String!"
 *   },
 *   contextual_arguments = {"language"}
 * )
 */
class NodePreview extends FieldPluginBase implements ContainerFactoryPluginInterface {
	use DependencySerializationTrait;

	/**
	 * The tempstore factory.
	 *
	 * @var \Drupal\Core\TempStore\PrivateTempStoreFactory
	 */
	protected $tempStoreFactory;
	/**
	 * The entity buffer service.
	 *
	 * @var \Drupal\graphql\GraphQL\Buffers\EntityBuffer
	 */
	protected $entityBuffer;

	/**
	 * The entity type manager service.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;

	/**
	 * The entity repository service.
	 *
	 * @var \Drupal\Core\Entity\EntityRepositoryInterface
	 */
	protected $entityRepository;

	/**
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
		return new static(
				$configuration,
				$pluginId,
				$pluginDefinition,
				$container->get('entity_type.manager'),
				$container->get('entity.repository'),
				$container->get('graphql.buffer.entity'),
				$container->get('tempstore.private')
		);
	}

	/**
	 * EntityById constructor.
	 *
	 * @param array $configuration
	 *   The plugin configuration array.
	 * @param string $pluginId
	 *   The plugin id.
	 * @param mixed $pluginDefinition
	 *   The plugin definition.
	 * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
	 *   The entity type manager service.
	 * @param \Drupal\Core\Entity\EntityRepositoryInterface $entityRepository
	 *   The entity repository service.
	 * @param \Drupal\graphql\GraphQL\Buffers\EntityBuffer $entityBuffer
	 *   The entity buffer service.
	 */
	public function __construct(
			array $configuration,
			$pluginId,
			$pluginDefinition,
			EntityTypeManagerInterface $entityTypeManager,
			EntityRepositoryInterface $entityRepository,
			EntityBuffer $entityBuffer,
			PrivateTempStoreFactory $temp_store_factory
	) {
		parent::__construct($configuration, $pluginId, $pluginDefinition);
		$this->entityBuffer = $entityBuffer;
		$this->entityTypeManager = $entityTypeManager;
		$this->entityRepository = $entityRepository;
		$this->tempStoreFactory = $temp_store_factory;
	}

	/**
	 * {@inheritdoc}
	 */
	protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		$store = $this->tempStoreFactory->get('node_preview');
		$preview = $store->get($args['uuid']);

		yield $preview->getFormObject()->getEntity();
	}

}
