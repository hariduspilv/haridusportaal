<?php

namespace Drupal\htm_custom_event_registration\Plugin\GraphQL\Mutations;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\Plugin\GraphQL\Mutations\Entity\CreateEntityBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Simple mutation for creating a new article node.
 *
 * @GraphQLMutation(
 *   id = "create_article",
 *   entity_type = "event_reg_entity",
 *   secure = true,
 *   name = "createArticle",
 *   type = "EntityCrudOutput!",
 *   arguments = {
 *     "input" = "ArticleInput"
 *   }
 * )
 */
class CreateEntity extends CreateEntityBase {


	/**
	 * @param $value
	 * @param array $args
	 * @param ResolveContext $context
	 * @param ResolveInfo $info
	 * @return array
	 */
	protected function extractEntityInput($value, array $args, ResolveContext $context, ResolveInfo $info){
		return [
				'name' => $args['input']['title'],
				'participant_first_name' => $args['input']['title'],
				'participant_last_name' => $args['input']['title'],
				'participant_email' => $args['input']['title'] . '@gmail.com',
				'event_reference' => 4581,
		];
	}

}