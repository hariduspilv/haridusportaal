<?php

namespace Drupal\htm_custom_subscriptions\Plugin\GraphQL\Mutations;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\Plugin\GraphQL\Mutations\Entity\UpdateEntityBase;
use Drupal\graphql_core\GraphQL\EntityCrudOutputWrapper;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Simple mutation for creating a new article node.
 *
 * @GraphQLMutation(
 *   id = "deactivate_tag_subscription",
 *   entity_type = "subscription_entity",
 *   secure = true,
 *   name = "deactivateTagSubscription",
 *   type = "EntityCrudOutput!",
 *   arguments = {
 *     "input" = "SubscriptionUpdate",
 *   }
 * )
 */
class DeactivateTagSubscription extends UpdateEntityBase{
	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;

	/**
	 * @param $value
	 * @param array $args
	 * @param ResolveContext $context
	 * @param ResolveInfo $info
	 * @return array
	 */
	protected function extractEntityInput($value, array $args, ResolveContext $context, ResolveInfo $info){
		return [
			'uuid' => $args['input']['uuid'],
		];
	}
	/**
	 * @inheritDoc
	 */
	public function resolve($value, array $args, ResolveContext $context, ResolveInfo $info)
	{

        $bundleName = $this->pluginDefinition['entity_bundle'];
		$entityTypeId = $this->pluginDefinition['entity_type'];
		$storage = $this->entityTypeManager->getStorage($entityTypeId);
		$entity = $storage->loadByProperties(['uuid' => $args['input']['uuid']]);

		if(count($entity) > 0){
			$args['id'] = reset($entity)->id();
		}

		if(isset($args['id'])){

			/** @var \Drupal\Core\Entity\ContentEntityInterface $entity */
	    if (!$entity = $storage->load($args['id'])) {
	      return new EntityCrudOutputWrapper(NULL, NULL, [
	        $this->t('The requested @bundle could not be loaded.', ['@bundle' => $bundleName]),
	      ]);
	    }
	    if (!$entity->bundle() === $bundleName) {
	      return new EntityCrudOutputWrapper(NULL, NULL, [
	        $this->t('The requested entity is not of the expected type @bundle.', ['@bundle' => $bundleName]),
	      ]);
	    }
	    if (!$entity->access('update')) {
	      return new EntityCrudOutputWrapper(NULL, NULL, [
	        $this->t('You do not have the necessary permissions to update this @bundle.', ['@bundle' => $bundleName]),
	      ]);
	    }

	    try {
				$entity->get('status')->setValue(0);
				$entity->get('newtags')->setValue('');
	    }
	    catch (\InvalidArgumentException $exception) {
	      return new EntityCrudOutputWrapper(NULL, NULL, [
	        $this->t('The entity update failed with exception: @exception.', ['@exception' => $exception->getMessage()]),
	      ]);
	    }
	    if (($violations = $entity->validate()) && $violations->count()) {
	      return new EntityCrudOutputWrapper(NULL, $violations);
	    }
	    if (($status = $entity->save()) && $status === SAVED_UPDATED) {
	      return new EntityCrudOutputWrapper($entity);
	    }
	    return NULL;

		}
	}
}
