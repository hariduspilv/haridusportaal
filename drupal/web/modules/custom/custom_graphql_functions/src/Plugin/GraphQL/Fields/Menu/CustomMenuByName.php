<?php

namespace Drupal\custom_graphql_functions\Plugin\GraphQL\Fields\Menu;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\EntityType;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\system\MenuInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GraphQL\Type\Definition\ResolveInfo;

use Drupal\Core\Language\LanguageManager;
use Drupal\custom_graphql_functions\Language\CustomGraphqlLanguageNegotiator;

/**
 * Retrieve a menu by it's name.
 *
 * @GraphQLField(
 *   id = "custom_menu_by_name",
 *   secure = true,
 *   name = "menuByName",
 *   description = @Translation("Loads a menu by its machine-readable name."),
 *   type = "Menu",
 *   arguments = {
 *     "name" = "String!",
 *   	 "language" = "LanguageId"
 *   },
 *   response_cache_contexts = {"languages:language_interface"}
 * )
 */
class CustomMenuByName extends FieldPluginBase implements ContainerFactoryPluginInterface {
	use DependencySerializationTrait;

	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;

	/**
	 * The Custom Language Negotiator.
	 *
	 * @var \ Drupal\custom_graphql_functions\Language\CustomGraphqlLanguageNegotiator
	 */
	protected $CustomGraphqlLanguageNegotiator;

	/**
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
		return new static($configuration, $pluginId, $pluginDefinition, $container->get('entity_type.manager'), $container->get('custom_graphql_functions.language_negotiator'),  $container->get('language_manager'));
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
	public function __construct(array $configuration, $pluginId, $pluginDefinition, EntityTypeManagerInterface $entityTypeManager, CustomGraphqlLanguageNegotiator $CustomGraphqlLanguageNegotiator,  LanguageManager $languageManager) {
		parent::__construct($configuration, $pluginId, $pluginDefinition);
		$this->entityTypeManager = $entityTypeManager;
		$this->CustomGraphqlLanguageNegotiator = $CustomGraphqlLanguageNegotiator;
		$this->languageManager = $languageManager;
	}

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		$this->languageManager->setNegotiator($this->CustomGraphqlLanguageNegotiator);

		// Set new language by its langcode.
		// Needed to re-run language negotiation.
		$this->languageManager->reset();
		$this->languageManager->getNegotiator()->setLanguageCode($args['language']);

		$entity = $this->entityTypeManager->getStorage('menu')->load($args['name']);

		if ($entity instanceof MenuInterface) {
			yield $entity;
		}
	}
}
