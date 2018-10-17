<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Events;


use Drupal\Core\Entity\TranslatableInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\paragraphs\ParagraphInterface;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "paragraph_reference",
 *   name = "paragraphReference",
 *   secure = true,
 *   type = "[Entity]",
 *   parents = {"Paragraph"},
 * )
 */
class reverseParagraph extends FieldPluginBase {

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if($value instanceof ParagraphInterface){
			$language = $context->getContext('language', $info);
			$entity = $value->getParentEntity();

			if($language && $entity instanceof TranslatableInterface && $entity->isTranslatable() && $entity->hasTranslation($language)){
				yield $entity->getTranslation($language);
			}else{
				yield $entity;
			}
		}
	}

}

