<?php

namespace Drupal\htm_custom_favorites\Plugin\GraphQL\Fields\Favorites;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManager;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @GraphQLField(
 *   id = "isfavourite",
 *   secure = true,
 *   name = "isFavorite",
 *   type = "Boolean",
 *   parents = {"Node"},
 *   response_cache_tags = {"favorite_entity_list"},
 *   response_cache_context = {"user", "languages:language_content"},
 * )
 */
class isFavourite extends FieldPluginBase implements ContainerFactoryPluginInterface {
	use DependencySerializationTrait;
	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;

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
		if($value instanceof Node){
			$storage = $this->entityTypeManager->getStorage('favorite_entity');
			if ($entity = $storage->loadByProperties(['user_idcode' => $this->getUserIDcode(), 'favorites_new' => $value->id()])) {
				yield true;
			}
		}
		yield false;
	}

	private function getUserIDcode(){
		return ($code = User::load($this->currentUser->id())->field_user_idcode->value) ? $code : 0 ;
	}

}
