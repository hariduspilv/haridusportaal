<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Link;

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;
use Drupal\Core\Link;

/**
 * Retrieve a link text.
 *
 * @GraphQLField(
 *   id = "custom_link_label",
 *   secure = true,
 *   name = "text",
 *   description = @Translation("The label of a link."),
 *   type = "String",
 *   parents = {"Link"},
 *   response_cache_contexts = {
 *     "languages:language_url",
 *     "languages:language_interface"
 *   },
 *   contextual_arguments = {"language"}
 * )
 */
class CustomLinkLabel extends FieldPluginBase {

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if ($value instanceof Link) {
			$text = $value->getText();
			if($text instanceof TranslatableMarkup){
				$langcode = \Drupal::languageManager()->getCurrentLanguage()->getId();
				$untranslated = $text->getUntranslatedString();
				$text = t($untranslated, [], ['langcode' => $langcode]);
			}
			yield $text;
		}
	}

}
