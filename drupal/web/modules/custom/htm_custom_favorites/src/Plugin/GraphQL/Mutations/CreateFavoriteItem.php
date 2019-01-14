<?php

namespace Drupal\htm_custom_favorites\Plugin\GraphQL\Mutations;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\EntityReferenceFieldItemListInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\GraphQL\EntityCrudOutputWrapper;
use Drupal\graphql_core\Plugin\GraphQL\Mutations\Entity\CreateEntityBase;
use Drupal\user\Entity\User;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Drupal\htm_custom_graphql_functions\Language\CustomGraphqlLanguageNegotiator;
use Drupal\Core\Language\LanguageManager;

/**
 * Simple mutation for creating a new article node.
 *
 * @GraphQLMutation(
 *   id = "create_favorite",
 *   entity_type = "favorite_entity",
 *   secure = true,
 *   name = "createFavoriteItem",
 *   type = "EntityCrudOutput!",
 *   arguments = {
 *     "input" = "FavoriteInput",
 *     "language" = "LanguageId!"
 *   },
 *   contextual_arguments = {"language"},
 *   response_cache_tags = {"favorite_entity_list"},
 *   response_cache_context = {"user"}
 * )
 */
class CreateFavoriteItem extends CreateEntityBase{

	/**
	 * The language context service.
	 *
	 * @var \Drupal\graphql\GraphQLLanguageContext
	 */
	protected $languageContext;
	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;

	/**
	 * The Custom Language Negotiator.
	 *
	 * @var \Drupal\custom_graphql_functions\Language\CustomGraphqlLanguageNegotiator
	 */
	protected $CustomGraphqlLanguageNegotiator;

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
				$container->get('htm_custom_graphql_functions.language_negotiator'),
				$container->get('current_user'),
				$container->get('language_manager'));
	}

	/**
	 * @inheritDoc
	 */
	public function __construct(
			array $configuration,
			$pluginId,
			$pluginDefinition,
			EntityTypeManagerInterface $entityTypeManager,
			CustomGraphqlLanguageNegotiator $CustomGraphqlLanguageNegotiator,
			AccountInterface $currentUser,
			LanguageManager $languageManager)
	{
		parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
		$this->CustomGraphqlLanguageNegotiator = $CustomGraphqlLanguageNegotiator;
		$this->languageManager = $languageManager;
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
				'favorites_new' => [
						'target_id' => isset($args['input']['page_id']) ? $args['input']['page_id'] : NULL,
						'title' => ''
				]
		];
	}

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
			$input = $this->extractEntityInput($value, $args, $context, $info);
			try{
				foreach($input as $key => $value){
					$field = $entity->get($key);
					if($field instanceof EntityReferenceFieldItemListInterface){
						$favorites = $entity->get('favorites_new')->getValue();
						$key = array_search($input['favorites_new']['target_id'], array_column($favorites, 'target_id'));
						if(!$key && $key !== (int) 0){
							$field->appendItem($value);
						}else{
							throw new \InvalidArgumentException('This page already exists');
						}
					}
				}
				if($entity->favorites_new->count() >= 11) {
					throw new \InvalidArgumentException((int) 1);
				}
			}
			catch (\InvalidArgumentException $exception) {
				return new EntityCrudOutputWrapper(NULL, NULL, [$exception->getMessage()]);
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


	protected function getCurrentUserIdCode()
	{
		return User::load($this->currentUser->id())->field_user_idcode->value;
	}
}