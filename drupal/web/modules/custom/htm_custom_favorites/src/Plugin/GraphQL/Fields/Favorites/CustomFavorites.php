<?php

namespace Drupal\htm_custom_favorites\Plugin\GraphQL\Fields\Favorites;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Cache\CacheableValue;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\user\Entity\User;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Language\LanguageManager;

/**
 * @GraphQLField(
 *   id = "custom_favorites",
 *   secure = true,
 *   name = "CustomFavorites",
 *   description = @Translation("Loads all user favorites"),
 *   type = "Entity",
 *   response_cache_tags = {"favorite_entity_list"},
 *   response_cache_context = {"user", "languages:language_content"},
 *   arguments = {
 *     "language" = "LanguageId"
 *   },
 *   contextual_arguments = {"language"}
 *
 * )
 */
class CustomFavorites extends FieldPluginBase implements ContainerFactoryPluginInterface{
	use DependencySerializationTrait;


	/**
	 * @var AccountInterface
	 */
	protected $currentUser;

	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;


	/**
	 * @var LanguageManager
	 */
	protected $languageManager;


	/**
	 * CustomFavorites constructor.
	 *
	 * @param array                      $configuration
	 * @param                            $pluginId
	 * @param                            $pluginDefinition
	 * @param AccountInterface           $currentUser
	 * @param EntityTypeManagerInterface $entityTypeManager
	 * @param LanguageManager            $languageManager
	 */
	public function __construct(
			array $configuration,
			$pluginId,
			$pluginDefinition,
			AccountInterface $currentUser,
			EntityTypeManagerInterface $entityTypeManager,
			LanguageManager $languageManager)
	{
		parent::__construct($configuration, $pluginId, $pluginDefinition);
		$this->currentUser = $currentUser;
		$this->entityTypeManager = $entityTypeManager;
		$this->languageManager = $languageManager;
	}

	/**
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
		return new static(
			$configuration,
			$pluginId,
			$pluginDefinition,
			$container->get('current_user'),
			$container->get('entity_type.manager'),
			$container->get('language_manager')
		);
	}
	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		#if($this->currentUser->isAuthenticated() && $this->getUserIDcode()) {
			$storage = $this->entityTypeManager->getStorage('favorite_entity');
			$entity = $storage->loadByProperties(['user_idcode' => $this->getUserIDcode()]);
			if (!$entity = reset($entity)) {
				return $this->resolveMissingEntity($value, $args, $info);
			}
			if ($entity instanceof TranslatableInterface && $entity->isTranslatable()) {
				return $this->resolveEntityTranslation($entity, $args, $info);
			}
			return $this->resolveEntity($entity, $args, $info);
		#}
		#return NULL;
	}

	/**
	 * @param EntityInterface $entity
	 * @param array           $args
	 * @param ResolveInfo     $info
	 * @return \Generator
	 */
	protected function resolveEntity(EntityInterface $entity, array $args, ResolveInfo $info) {
		$access = $entity->access('view', NULL, TRUE);
		#dump($access);
		if ($access->isAllowed()) {
			yield $entity->addCacheableDependency($access);
		}
		else {
			yield new CacheableValue(NULL, [$access]);
		}
	}

	/**
	 * @param array $value
	 *   The url of the entity to resolve.
	 * @param array $args
	 *   The field arguments array.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return \Generator
	 */
	protected function resolveMissingEntity($value, $args, $info) {
		yield (new CacheableValue(NULL))->addCacheTags(['4xx-response']);
	}


	/**
	 * @param EntityInterface $entity
	 * @param array           $args
	 * @param ResolveInfo     $info
	 * @return \Generator
	 */
	protected function resolveEntityTranslation(EntityInterface $entity, array $args, ResolveInfo $info) {
		if ($entity instanceof TranslatableInterface && isset($args['language'])) {
			$entity = $entity->getTranslation($args['language']);
		}
		return $this->resolveEntity($entity, $args, $info);
	}

	private function getUserIDcode(){
		return ($code = User::load($this->currentUser->id())->field_user_idcode->value) ? $code : 0 ;
	}
}