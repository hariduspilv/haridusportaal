<?php

namespace Drupal\htm_custom_event_registration\Plugin\GraphQL\Mutations;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\graphql\Plugin\GraphQL\Mutations\MutationPluginBase;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use Drupal\graphql_core\GraphQL\EntityCrudOutputWrapper;
use GraphQL\Type\Definition\ResolveInfo;
use Drupal\graphql\GraphQL\Execution\ResolveContext;

/**
 * Login User.
 *
 * @GraphQLMutation(
 *   id = "user_register_event",
 *   name = "EventRegister",
 *   secure = false,
 *   type = "User",
 *   schema_cache_tags = {"user_register_event"},
 *   arguments = {
 *     "eventId" = "Int!",
 *     "firstName" = "String!",
 *     "lastName" = "String!",
 *   	 "organization" = "String",
 *     "email" = "Email!",
 *   	 "phone" = "String",
 *     "comment" = "String",
 * 		 "language" = "LanguageId!",
 *   }
 * )
 */
class EventRegister extends MutationPluginBase implements ContainerFactoryPluginInterface {
	use DependencySerializationTrait;
	use StringTranslationTrait;

	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;

	/**
	 * The current user service.
	 *
	 * @var \Drupal\Core\Session\AccountInterface
	 */
	protected $currentUser;

	/**
	 * {@inheritdoc}
	 */
	public function __construct(
			array $configuration,
			$pluginId,
			$pluginDefinition,
			EntityTypeManagerInterface $entityTypeManager,
			ConfigFactoryInterface $configFactory,
			AccountInterface $currentUser
	) {
		$this->entityTypeManager = $entityTypeManager;
		$this->configFactory = $configFactory;
		$this->currentUser = $currentUser;

		parent::__construct($configuration, $pluginId, $pluginDefinition);
	}

	/**
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
		return new static(
				$configuration,
				$pluginId,
				$pluginDefinition,
				$container->get('entity_type.manager'),
				$container->get('config.factory'),
				$container->get('current_user')
		);
	}

	/**
	 * Logs in a user.
	 *
	 * @return \Drupal\user\UserInterface
	 *   The newly logged user.
	 */
	public function resolve($value, array $args, ResolveContext $context, ResolveInfo $info) {
		//$login_controller = new \Drupal\user\Controller\UserAuthenticationController();
		//return $login_controller->login($args);
		$uid = $this->currentUser->id();
		//dump($this->currentUser);
		$user = $this->entityTypeManager->getStorage('user')->load($uid);
		//return
		return $user;
		//return
	}
}