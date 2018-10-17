<?php

namespace Drupal\htm_custom_event_registration\Plugin\GraphQL\Mutations;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\GraphQL\EntityCrudOutputWrapper;
use Drupal\graphql_core\Plugin\GraphQL\Mutations\Entity\CreateEntityBase;
use Drupal\node\Entity\Node;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Drupal\htm_custom_graphql_functions\Language\CustomGraphqlLanguageNegotiator;
use Drupal\Core\Language\LanguageManager;

/**
 * Simple mutation for creating a new article node.
 *
 * @GraphQLMutation(
 *   id = "create_event_reg",
 *   entity_type = "event_reg_entity",
 *   secure = true,
 *   name = "createEventRegistration",
 *   type = "EntityCrudOutput!",
 *   arguments = {
 *     "input" = "EventInput",
 * 		 "language" = "LanguageId!"
 *   }
 * )
 */
class CreateEventRegistration extends CreateEntityBase{

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
		LanguageManager $languageManager)
	{
		parent::__construct($configuration, $pluginId, $pluginDefinition, $entityTypeManager);
		$this->CustomGraphqlLanguageNegotiator = $CustomGraphqlLanguageNegotiator;
		$this->languageManager = $languageManager;
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
			'name' => $args['input']['first_name'] . ' ' . $args['input']['last_name'],
			'event_reference' => $args['input']['event_id'],
			'language' => $context->getContext('language', $info),
			'participant_first_name' => $args['input']['first_name'],
			'participant_last_name' => $args['input']['last_name'],
			'participant_organization' => isset($args['input']['organization']) ? $args['input']['organization'] : '',
			'participant_email' => $args['input']['email'],
			'participant_phone' => isset($args['input']['phone']) ? $args['input']['phone'] : '',
			'participant_idcode' => isset($args['input']['id_code']) ? $args['input']['id_code'] : '',
			'participant_comment' => isset($args['input']['comment']) ? $args['input']['comment'] : '',
		];
	}

	/**
	 * @inheritDoc
	 */
	public function resolve($value, array $args, ResolveContext $context, ResolveInfo $info)
	{
		$this->languageManager->setNegotiator($this->CustomGraphqlLanguageNegotiator);
		//dump($args);
		// Set new language by its langcode.
		// Needed to re-run language negotiation.
		$this->languageManager->reset();
		$this->languageManager->getNegotiator()->setLanguageCode($args['language']);

		$context->setContext('language', $args['language'], $info);

		/*return parent::resolve($value, $args, $context, $info);*/
		$entityTypeId = $this->pluginDefinition['entity_type'];
		// The raw input needs to be converted to use the proper field and property
		// keys because we usually convert them to camel case when adding them to
		// the schema.
		$input = $this->extractEntityInput($value, $args, $context, $info);

		//check if user can register

		$entityDefinition = $this->entityTypeManager->getDefinition($entityTypeId);
		if ($entityDefinition->hasKey('bundle')) {
			$bundleName = $this->pluginDefinition['entity_bundle'];
			$bundleKey = $entityDefinition->getKey('bundle');
			// Add the entity's bundle with the correct key.
			$input[$bundleKey] = $bundleName;
		}
		$storage = $this->entityTypeManager->getStorage($entityTypeId);
		$entity = $storage->create($input);
		#dump(!$this->canRegister($input, $storage));
		if(!$this->canRegister($input, $storage)){
			//error 1 means registrations full
			return new EntityCrudOutputWrapper(NULL, NULL, [1]);
		}else{
			return $this->resolveOutput($entity, $args, $info);
		}

	}

	protected function canRegister($input, EntityStorageInterface $storage){
		$node = Node::load($input['event_reference']);
		$registration_count = (int) $node->get('field_max_number_of_participants')->value;
		$registred = count($storage->loadByProperties(['event_reference' => $input['event_reference']]));
		return ($registred >= $registration_count) ? FALSE : TRUE;

	}

}