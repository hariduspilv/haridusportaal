<?php

namespace Drupal\htm_custom_event_registration\Plugin\GraphQL\Fields\Registrations;

use Drupal\graphql\GraphQL\Cache\CacheableValue;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "registration_count",
 *   secure = true,
 *   name = "RegistrationCount",
 *   type = "Int",
 *   parents = {"NodeEvent"},
 *   response_cache_tags = {"event_reg_entity_list"}
 * )
 */
class CustomEventRegistrationsCount extends FieldPluginBase {

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		$query = \Drupal::entityQuery('event_reg_entity');
		$query->accessCheck(TRUE);
		$query->condition('event_reference', $value->id(), '=');
		#yield new CacheableValue($query->count()->execute(), ['event_reg_entity_list']);
		yield $query->count()->execute();

	}

}
