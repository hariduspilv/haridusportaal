<?php

namespace Drupal\htm_custom_favorites\Plugin\GraphQL\Fields\Favorites;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Session\AccountInterface;
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
 *   type = "[Entity]",
 *   response_cache_tags = {"favorite_entity_list"}
 *
 * )
 */
class CustomFavorites extends FieldPluginBase implements ContainerFactoryPluginInterface{
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
				$container->get('current_user'),
				$container->get('entity_type.manager'),
				$container->get('language_manager')
		);
	}

	/**
	 * MenuByName constructor.
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
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if($this->currentUser->isAuthenticated() && $this->getUserIDcode()){
			$query = \Drupal::entityQuery('favorite_entity');
			$query->accessCheck(TRUE);
			$query->condition('user_idcode', $this->getUserIDcode());
			$entity = $query->execute();
			foreach($entity as $item){
				yield $this->entityTypeManager->getStorage('favorite_entity')->load($item);
			}
		}else{
			return NULL;
		}
	}
	private function getUserIDcode(){
		return User::load($this->currentUser->id())->field_user_idcode->value;
	}
}