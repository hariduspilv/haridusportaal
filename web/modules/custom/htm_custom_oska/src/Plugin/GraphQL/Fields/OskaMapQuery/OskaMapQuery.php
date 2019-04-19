<?php

namespace Drupal\htm_custom_oska\Plugin\GraphQL\Fields\OskaMapQuery;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;
use League\Csv\Reader;

/**
 * @GraphQLField(
 *   id = "oska_map_query",
 *   secure = true,
 *   type = "[OskaMap]",
 *   name = "OskaMapQuery",
 * )
 */
class OskaMapQuery extends FieldPluginBase {

    /**
     * {@inheritdoc}
     */
    public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {

        $value['OskaMapJson'] = $this->getCsvValues();

        yield $value;
    }

    public function getCsvValues(){
        $result_array = [];
        $csv_path = '/app/drupal/web/sites/default/files/private/oska_csv/oska_map_csv.csv';
        $reader = Reader::createFromPath($csv_path, 'r');
        $records = $reader->getRecords();

        foreach($records as $record){
            $result_array[] = $record;
        }

        return json_encode($result_array);
    }

    /**
     * Retrieve the list of cache dependencies for a given value and arguments.
     *
     * @param array $result
     *   The result of the field.
     * @param mixed $parent
     *   The parent value.
     * @param array $args
     *   The arguments passed to the field.
     * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
     *   The resolve context.
     * @param \GraphQL\Type\Definition\ResolveInfo $info
     *   The resolve info object.
     *
     * @return array
     *   A list of cacheable dependencies.
     */
    protected function getCacheDependencies(array $result, $parent, array $args, ResolveContext $context, ResolveInfo $info) {
        $cache = parent::getCacheDependencies($result, $parent, $args, $context, $info);

        $cache[0]->setCacheTags(['oska_map_csv']);

        return $cache;
    }
}
