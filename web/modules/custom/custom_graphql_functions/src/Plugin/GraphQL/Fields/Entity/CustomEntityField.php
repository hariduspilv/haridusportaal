mespace Drupal\custom_graphql_functions\Plugin\GraphQL\Fields\Entity;

use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\graphql\GraphQL\Cache\CacheableValue;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\Plugin\GraphQL\Fields\EntityFieldBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "custom_entity_field",
 *   secure = true,
 *   weight = -2,
 *   deriver = "Drupal\graphql_core\Plugin\Deriver\Fields\EntityFieldDeriver",
 * )
 */
class CustomEntityField extends EntityFieldBase {

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if ($value instanceof FieldableEntityInterface) {
			$definition = $this->getPluginDefinition();
			$name = $definition['field'];
			if ($value->hasField($name)) {
				/** @var \Drupal\Core\Field\FieldItemListInterface $items */
				$items = $value->get($name);
				$access = $items->access('view', NULL, TRUE);
				/*dump($access);*/
				if ($access->isAllowed()) {
					foreach ($items as $item) {
						// Do not yield untranslated paragraphs
						if(empty($definition['property'])){
							/** @var \Drupal\Core\Entity\ContentEntityBase $entity */
							if(($entity = $item->entity) && $item->entity->isTranslatable() /*&& ($item->entity->getEntityTypeId() === 'paragraph' || $item->entity->getEntityTypeId() === 'taxonomy_term')*/){
								$translated = ($entity->hasTranslation($context->getContext('language', $info)));
								if(!$translated) continue;
							}
						}
						$output = !empty($definition['property']) ? $this->resolveItem($item, $args, $context, $info) : $item;
						yield new CacheableValue($output, [$access]);
					}
				}
			}
		}
	}
}

