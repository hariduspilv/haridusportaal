<?php

namespace Drupal\custom_graphql_tags_query\Plugin\GraphQL\Fields\TagsQuery;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Error\Error;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GraphQL\Type\Definition\ResolveInfo;
use Drupal\Core\Field\EntityReferenceFieldItemList;
/**
 * A simple field that returns the page title.
 *
 * For simplicity reasons, this example does not utilize dependency injection.
 *
 * @GraphQLField(
 *   id = "custom_tags_query",
 *   secure = true,
 *   name = "customTagsQuery",
 *   description = @Translation("Description"),
 *   type = "EntityQueryResult",
 *   arguments = {
 *   		"type" = "[String]!"
 *	 }
 * )
 */
class TagsQuery extends FieldPluginBase implements ContainerFactoryPluginInterface {
	use DependencySerializationTrait;

	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;

	/**
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
		return new static(
				$configuration,
				$pluginId,
				$pluginDefinition,
				$container->get('entity_type.manager')
		);
	}

	/**
	 * EntityQuery constructor.
	 *
	 * @param array $configuration
	 *   The plugin configuration array.
	 * @param string $pluginId
	 *   The plugin id.
	 * @param mixed $pluginDefinition
	 *   The plugin definition.
	 * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
	 *   The entity type manager service.
	 */
	public function __construct(array $configuration, $pluginId, $pluginDefinition, EntityTypeManagerInterface $entityTypeManager) {
		parent::__construct($configuration, $pluginId, $pluginDefinition);
		$this->entityTypeManager = $entityTypeManager;
	}


	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		yield $this->getBaseQuery($value, $args, $context, $info);
	}
	/**
	 * Create the basic entity query for the plugin's entity type.
	 *
	 * @param mixed $value
	 *   The parent entity type.
	 * @param array $args
	 *   The field arguments array.
	 * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
	 *   The resolve context.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return \Drupal\Core\Entity\Query\QueryInterface
	 *   The entity query object.
	 */
	protected function getBaseQuery($value, array $args, ResolveContext $context, ResolveInfo $info) {
		$tids = [];
		//dump($args);
		//$mingiasi = $args, 'status' => 1];
		//dump($mingiasi);
		$nodeStorage = $this->entityTypeManager->getStorage('node')->loadByProperties($args + ['status' => 1]);

		foreach($nodeStorage as $node){
			foreach ($node->getFields() as $field) {
				// Only look for fields that are entity reference fields.
				if ($field instanceof EntityReferenceFieldItemList) {
					// Get the field settings.
					$field_definition = $field->getFieldDefinition();
					$target_type = $field_definition->getSetting('target_type');
					// Check that the field targets are taxonomy terms.
					if ($target_type == 'taxonomy_term') {
						foreach($field->getValue() as $targets){
							$tids[$targets['target_id']] = $targets['target_id'];
						}
						//dump($field_definition->getSetting('target_id'));
					}
				}
			}
		}


		$entityStorage = $this->entityTypeManager->getStorage('taxonomy_term');
		$query = $entityStorage->getQuery();
		$query->accessCheck(TRUE)
					//->condition('vid', ['tags', 'news_tags'], 'IN')
					->condition('tid', $tids, 'IN');
		//dump($query->execute());


		// The context object can e.g. transport the parent entity language.
		$query->addMetaData('graphql_context', $this->getQueryContext($value, $args, $context, $info));

		return $query;
	}

	/**
	 * Retrieves an arbitrary value to write into the query metadata.
	 *
	 * @param mixed $value
	 *   The parent value.
	 * @param array $args
	 *   The field arguments array.
	 * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
	 *   The resolve context.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return mixed
	 *   The query context.
	 */
	protected function getQueryContext($value, array $args, ResolveContext $context, ResolveInfo $info) {
		// Forward the whole set of arguments by default.
		return [
				'parent' => $value,
				'args' => $args,
				'info' => $info,
		];
	}
}