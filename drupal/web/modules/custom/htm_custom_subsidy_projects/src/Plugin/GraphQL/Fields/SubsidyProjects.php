<?php

namespace Drupal\htm_custom_subsidy_projects\Plugin\GraphQL\Fields;

use Drupal\Core\Entity\TranslatableInterface;
use Drupal\graphql\GraphQL\Cache\CacheableValue;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\Plugin\GraphQL\Fields\EntityQuery\EntityQueryEntities;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "custom_subsidy_projects",
 *   secure = true,
 *   name = "CustomSubsidyProjects",
 *   type = "[Entity]",
 *   parents = {"NodeSchool"},
 * )
 */
class SubsidyProjects extends EntityQueryEntities {

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		#dump($value->get('field_ehis_id')->value);
		if($value->get('field_ehis_id')->value){
			$query = \Drupal::entityQuery('subsidy_project_entity');
			$query->accessCheck(TRUE);
			$query->condition('ehis_id', $value->get('field_ehis_id')->value, '=');

			$type = $query->getEntityTypeId();
			$result = $query->execute();
			$metadata = $query->getMetaData('graphql_context');

			return $this->resolveFromEntityIds($type, array_values($result), $metadata, $args, $context, $info);

		}

	}

	/**
	 * Resolves entities lazily through the entity buffer.
	 *
	 * @param string $type
	 *   The entity type.
	 * @param array $ids
	 *   The entity ids to load.
	 * @param mixed $metadata
	 *   The query context.
	 * @param array $args
	 *   The field arguments array.
	 * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
	 *   The resolve context.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return \Closure
	 *   The deferred resolver.
	 */
	protected function resolveFromEntityIds($type, $ids, $metadata, array $args, ResolveContext $context, ResolveInfo $info) {
		$resolve = $this->entityBuffer->add($type, $ids);
		return function($value, array $args, ResolveContext $context, ResolveInfo $info) use ($resolve, $metadata) {
			return $this->resolveEntities($resolve(), $metadata, $args,  $context, $info);
		};
	}
	/**
	 * Resolves entity objects and checks view permissions.
	 *
	 * @param array $entities
	 *   The entities to resolve.
	 * @param mixed $metadata
	 *   The query context.
	 * @param array $args
	 *   The field arguments array.
	 * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
	 *   The resolve context.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return \Generator
	 *   The resolved entities.
	 */
	protected function resolveEntities(array $entities, $metadata, array $args, ResolveContext $context, ResolveInfo $info) {
		$language = $this->negotiateLanguage($metadata, $args, $context, $info);

		/** @var \Drupal\Core\Entity\EntityInterface $entity */
		foreach ($entities as $entity) {
			// Translate the entity if it is translatable and a language was given.
			if ($language && $entity instanceof TranslatableInterface && $entity->isTranslatable()) {
				yield $entity->getTranslation($language);
			}

			$access = $entity->access('view', NULL, TRUE);
			if ($access->isAllowed()) {
				yield $entity->addCacheableDependency($access);
			}
			else {
				yield new CacheableValue(NULL, [$access]);
			}
		}
	}

	/**
	 * Negotiate the language for the resolved entities.
	 *
	 * @param mixed $metadata
	 *   The query context.
	 * @param array $args
	 *   The field arguments array.
	 * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
	 *   The resolve context.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return string|null
	 *   The negotiated language id.
	 */
	protected function negotiateLanguage($metadata, $args, ResolveContext $context, ResolveInfo $info) {
		if (!empty($args['language'])) {
			return $args['language'];
		}

		if (isset($metadata['parent']) && ($parent = $metadata['parent']) && $parent instanceof EntityInterface) {
			return $parent->language()->getId();
		}

		return NULL;
	}

}
