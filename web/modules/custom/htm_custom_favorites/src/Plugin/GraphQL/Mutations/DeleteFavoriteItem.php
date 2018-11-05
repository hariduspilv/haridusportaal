<?php

namespace Drupal\htm_custom_favorites\Plugin\GraphQL\Mutations;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\GraphQL\EntityCrudOutputWrapper;
use Drupal\graphql_core\Plugin\GraphQL\Mutations\Entity\CreateEntityBase;
use Drupal\graphql_core\Plugin\GraphQL\Mutations\Entity\DeleteEntityBase;
use Drupal\user\Entity\User;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Simple mutation for creating a new article node.
 *
 * @GraphQLMutation(
 *   id = "delete_favorite",
 *   entity_type = "favorite_entity",
 *   secure = true,
 *   name = "deleteFavoriteItem",
 *   type = "EntityCrudOutput!",
 *   arguments = {
 *     "id" = "Int!",
 *   	 "language" = "LanguageId!"
 *   },
 *   contextual_arguments = {"language"}
 * )
 */
class DeleteFavoriteItem extends DeleteEntityBase {

	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;


	/**
	 * @inheritDoc
	 */
	public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition)
	{
		return new static(
				$configuration,
				$pluginId,
				$pluginDefinition,
				$container->get('entity_type.manager'),
				$container->get('current_user')
		);
	}

	/**
	 * @inheritDoc
	 */
	public function __construct(
			array $configuration,
			$pluginId,
			$pluginDefinition,
			EntityTypeManagerInterface $entityTypeManager,
			AccountInterface $currentUser)
	{
		parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
		$this->currentUser = $currentUser;
	}


	/**
	 * @param $value
	 * @param array $args
	 * @param ResolveContext $context
	 * @param ResolveInfo $info
	 * @return array
	 */
	protected function extractEntityInput($value, array $args, ResolveContext $context, ResolveInfo $info){
		return [
			'id' => $args['id'],
		];
	}

	/**
	 * @inheritDoc
	 */
	public function resolve($value, array $args, ResolveContext $context, ResolveInfo $info)
	{
		//set context manually
		$context->setContext('language', $args['language'], $info);
		$entityTypeId = $this->pluginDefinition['entity_type'];
		$storage = $this->entityTypeManager->getStorage($entityTypeId);

		/** @var \Drupal\Core\Entity\ContentEntityInterface $entity */
		$entity = $storage->loadByProperties(['user_idcode' => $this->getCurrentUserIdCode()]);

		if (!$entity) {
			return parent::resolve($value, $args, $context, $info);
		}else{
			$entity = reset($entity);
			#dump($entity);
			$input = $this->extractEntityInput($value, $args, $context, $info);
			try{
				$favorites = $entity->get('favorites_new')->getValue();
				$key = array_search($input['id'], array_column($favorites, 'target_id'));
				if($key || $key === (int) 0){
					$entity->get('favorites_new')->removeItem($key);
					$entity->save();
				} else {
					throw new \InvalidArgumentException('This page does not exist');
				}
			}
			catch (\InvalidArgumentException $exception) {
				return new EntityCrudOutputWrapper($entity, NULL, [
						$this->t('The entity update failed with exception: @exception.', ['@exception' => $exception->getMessage()]),
				]);
			}
			if (($violations = $entity->validate()) && $violations->count()) {
				return new EntityCrudOutputWrapper(NULL, $violations);
			}
			if (($status = $entity->save()) && $status === SAVED_UPDATED) {
				$favorites_new = $entity->get('favorites_new')->getValue();
				#dump($favorites_new);
				if(empty($favorites_new)){
					$entity->delete();
					return new EntityCrudOutputWrapper(NULL, NULL);
				}
				return new EntityCrudOutputWrapper($entity);
			}
			return NULL;
		}

	}

	protected function getCurrentUserIdCode(){
		return User::load($this->currentUser->id())->field_user_idcode->value;
	}

}