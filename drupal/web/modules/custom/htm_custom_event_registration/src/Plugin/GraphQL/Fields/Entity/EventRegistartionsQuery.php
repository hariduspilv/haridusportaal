<?php

namespace Drupal\htm_custom_event_registration\Plugin\GraphQL\Fields\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\Plugin\GraphQL\Fields\EntityQuery\EntityQuery;
use GraphQL\Type\Definition\ResolveInfo;
use Drupal\user\Entity\User;

use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Query entities of the same type without the context's entity.
 *
 * @GraphQLField(
 *   id = "event_registration_query",
 *   name = "EventRegistrations",
 *   secure = true,
 *   type = "EntityQueryResult",
 *   parents = {"Entity"},
 * )
 */
class EventRegistartionsQuery extends EntityQuery {

	/**
	 * The current user account.
	 *
	 * @var \Drupal\Core\Session\AccountProxyInterface
	 */
	protected $currentUser;


	/**
	 * @inheritDoc
	 */
	public function __construct(
			array $configuration,
			$pluginId,
			$pluginDefinition,
			EntityTypeManagerInterface $entityTypeManager,
			AccountProxyInterface $currentUser
	) {
		parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
		$this->currentUser = $currentUser;
	}

	/**
	 * @inheritDoc
	 */
	public static function create(
			ContainerInterface $container,
			array $configuration,
			$pluginId,
			$pluginDefinition
	){
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
	public function resolve($value, array $args, ResolveContext $context, ResolveInfo $info)
	{
		$user = $this->getCurrentUserEntity();
		if($this->currentUser->isAuthenticated() && ($user->field_user_idcode->value === $value->field_organizer_idcode->value)){
			return parent::resolve($value, $args, $context, $info);
		}
	}


	/**
	 * {@inheritdoc}
	 */
	protected function getBaseQuery($value, array $args, ResolveContext $context, ResolveInfo $info) {
		$user = $this->getCurrentUserEntity();
		#dump($this->currentUser);
		$user_idCode = $user->field_user_idcode->value;
		if ($value instanceof ContentEntityInterface) {
			$query = \Drupal::entityQuery('event_reg_entity');
			$query->accessCheck(TRUE);

			// The context object can e.g. transport the parent entity language.
			$query->addMetaData('graphql_context', $this->getQueryContext($value, $args, $context, $info));
			$query->condition('event_reference', $value->get('nid')->value, '=');
			#return false;
			return $query;
		}
	}

	protected function getCurrentUserEntity(){
		return User::load($this->currentUser->id());
	}

}
