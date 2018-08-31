<?php

namespace Drupal\htm_custom_favorites\Plugin\GraphQL\Mutations;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\GraphQL\EntityCrudOutputWrapper;
use Drupal\graphql_core\Plugin\GraphQL\Mutations\Entity\CreateEntityBase;
use Drupal\paragraphs\Entity\Paragraph;
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
 *     "id" = "Int!"
 *   }
 * )
 */
class DeleteFavoriteItem extends CreateEntityBase{

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
			'user_idcode' => $this->getCurrentUserIdCode(),
			'id' => $args['input']['id'],
		];
	}

	/**
	 * @inheritDoc
	 */
	public function resolve($value, array $args, ResolveContext $context, ResolveInfo $info)
	{
		$para_id = $args['id'];
		$entityTypeId = $this->pluginDefinition['entity_type'];

		$storage = $this->entityTypeManager->getStorage($entityTypeId);
		$entity = $storage->loadByProperties(['user_idcode' => $this->getCurrentUserIdCode()]);

		$paragraph = $this->entityTypeManager->getStorage('paragraph')->load($para_id);
		if($entity){
			if($paragraph){
				$entity = reset($entity);

				foreach($paragraphs = $entity->favorites->getValue() as $index => $favorite){
					if($favorite['target_id'] == $para_id){
						//remove from entity
						unset($paragraphs[$index]);
						//delete paragraph from DB
						#$paragraph->delete();
					}
				}
				dump($paragraphs);
				$entity->favorites->setValue($paragraphs);

				if($entity->favorites->count() > 0){
					#dump($entity->favorites->count());
					#$entity->save();
					return $this->resolveOutputUpdate($entity, $args, $info);
				}else{
					$entity->delete();
					return new EntityCrudOutputWrapper(NULL, NULL);
				}
			}else{
				return new EntityCrudOutputWrapper(NULL, NULL, [
						$this->t('Favorite not found')
				]);
			}
		}else{
			return new EntityCrudOutputWrapper(NULL, NULL, [
					$this->t('This user has no favorites')
			]);
		}
	}

	public function resolveOutputUpdate(EntityInterface $entity, array $args, ResolveInfo $info){
		if (!$entity->access('create')) {
			return new EntityCrudOutputWrapper(NULL, NULL, [
					$this->t('You do not have the necessary permissions to create entities of this type.'),
			]);
		}
		if ($entity instanceof ContentEntityInterface) {
			if (($violations = $entity->validate()) && $violations->count()) {
				return new EntityCrudOutputWrapper(NULL, $violations);
			}
		}
		if (($status = $entity->save()) && $status === SAVED_UPDATED) {
			return new EntityCrudOutputWrapper($entity);
		}
	}

	protected function getCurrentUserIdCode(){
		return User::load($this->currentUser->id())->field_user_idcode->value;
	}

}