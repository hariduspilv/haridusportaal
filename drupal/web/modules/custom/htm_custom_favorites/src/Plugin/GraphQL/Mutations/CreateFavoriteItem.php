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

use Drupal\custom_graphql_functions\Language\CustomGraphqlLanguageNegotiator;
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
 * 		 "language" = "LanguageId!"
 *   }
 * )
 */
class CreateFavoriteItem extends CreateEntityBase{

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
			$container->get('custom_graphql_functions.language_negotiator'),
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
		//dump($this->currentUser);
		//dump($args);
		//die();
		return [
			'user_idcode' => $this->getCurrentUserIdCode(),
			'favorites' => [
				'field_favorite_title' => $args['input']['favorite_title'],
				'field_page' => $args['input']['page_id'],
				'field_search' => $args['input']['search'],
				'field_type' => $args['input']['type'],
			]
		];
	}

	/**
	 * @inheritDoc
	 */
	public function resolve($value, array $args, ResolveContext $context, ResolveInfo $info)
	{
		$user_idcode = $this->getCurrentUserIdCode();

		//$paragraph = $this->entityTypeManager->getStorage('paragraph')->loadByProperties(['id' => '40']);
		//$para = reset($paragraph);
		//if($para) $para->delete();
		/*
		  if (($key = array_search($del_val, $messages)) !== false) {
    		unset($messages[$key]);
			}
		*/

		$entityTypeId = $this->pluginDefinition['entity_type'];
		$input = $this->extractEntityInput($value, $args, $context, $info);

		$favs = $input['favorites'];
		unset($input['favorites']);

		$entityDefinition = $this->entityTypeManager->getDefinition($entityTypeId);
		if ($entityDefinition->hasKey('bundle')) {
			$bundleName = $this->pluginDefinition['entity_bundle'];
			$bundleKey = $entityDefinition->getKey('bundle');
			// Add the entity's bundle with the correct key.
			$input[$bundleKey] = $bundleName;
		}
		$storage = $this->entityTypeManager->getStorage($entityTypeId);
		$entity = $storage->loadByProperties(['user_idcode' => $this->getCurrentUserIdCode()]);

		if(!$entity){
			$entity = $storage->create($input);

			/*set favorites*/
			$entity->favorites[] = $this->createNewFavoriteParagraph($favs);

			return $this->resolveOutput($entity, $args, $info);
		}else{
			$entity = reset($entity);
			try {
				foreach ($input as $key => $value) {
					$entity->get($key)->setValue($value);
				}
				if($entity->favorites->count() >= 10){
					return new EntityCrudOutputWrapper($entity, NULL, [
							$this->t('Favorite limit reached (max 10)')
					]);
				}else{
					/*append favorites*/
					$entity->favorites[] = $this->createNewFavoriteParagraph($favs);
				}
			}
			catch (\InvalidArgumentException $exception) {
				return new EntityCrudOutputWrapper(NULL, NULL, [
						$this->t('The entity update failed with exception: @exception.', ['@exception' => $exception->getMessage()]),
				]);
			}

			return $this->resolveOutputUpdate($entity, $args, $info);
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

	protected function createNewFavoriteParagraph($items){
		//dump($items);
		$paragraph = Paragraph::create([
			'type' => 'favorite_item',
		] + $items);
		$paragraph->save();
		//dump($paragraph->id());
		return $paragraph;
	}

}