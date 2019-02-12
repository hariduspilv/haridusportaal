<?php

namespace Drupal\htm_custom_oska\Plugin\GraphQL\Fields\GoogleChartQuery;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GraphQL\Type\Definition\ResolveInfo;
use Drupal\graphql\GraphQL\Buffers\SubRequestBuffer;
use League\Csv\Reader;
use League\Csv\Statement;
use Drupal\Core\StringTranslation\StringTranslationTrait;



/**
 * @GraphQLField(
 *   id = "google_chart_query",
 *   secure = true,
 *   type = "[GoogleChart]",
 *   name = "GoogleChartQuery",
 *   response_cache_contexts = {"languages:language_url"},
 *   arguments = {
 *     "filters" = "GoogleChartFilterInput",
 *   }
 * )
 */
class GoogleChartQuery extends FieldPluginBase implements ContainerFactoryPluginInterface {
    use DependencySerializationTrait;

    /**
     * The sub-request buffer service.
     *
     * @var \Drupal\graphql\GraphQL\Buffers\SubRequestBuffer
     */
    protected $subRequestBuffer;

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
        return new static(
            $configuration,
            $pluginId,
            $pluginDefinition,
            $container->get('graphql.buffer.subrequest')
        );
    }

    /**
     * Metatags constructor.
     *
     * @param array $configuration
     *   The plugin configuration array.
     * @param string $pluginId
     *   The plugin id.
     * @param mixed $pluginDefinition
     *   The plugin definition array.
     */
    public function __construct(
        array $configuration,
        $pluginId,
        $pluginDefinition,
        SubRequestBuffer $subRequestBuffer
    ) {
        parent::__construct($configuration, $pluginId, $pluginDefinition);
        $this->subRequestBuffer = $subRequestBuffer;
    }

    /**
     * {@inheritdoc}
     */
    public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {

        $value['ChartValue'] = $this->getGoogleChartValue($args);

        yield $value;
    }

    public function getGoogleChartValue($args){

        $graph_info = $args['filters'];

        $filter_values = $graph_info;
        $graph_info_fields = [
            'graph_set',
            'graph_type',
            'secondary_graph_type',
            'graph_group_by',
        ];

        foreach($graph_info as $key => $value){
            if(!in_array($key, $graph_info_fields)){
                $filter_values[$key] = $value;
                unset($graph_info[$key]);
            }else{
                unset($filter_values[$key]);
            }
        }

        if(isset($filter_values['secondary_graph_indicator'])){
            $filter_values['indicator'] = [$filter_values['indicator'], $filter_values['secondary_graph_indicator']];
            unset($filter_values['secondary_graph_indicator']);
        }

        $filter_values['naitaja'] = $filter_values['indicator'];
        unset($filter_values['indicator']);

        $this->filter_values = $filter_values;

        $reader = Reader::createFromPath('/app/drupal/web/sites/default/files/private/oska_csv/oska_csv.csv', 'r');
        $reader->setDelimiter(';');
        $reader->setHeaderOffset(0);
        $stmt = (new Statement())
            ->where([$this,'applyFilters']);

        $records = iterator_to_array($stmt->process($reader), false);

        if(isset($records) && count($records) > 0){
            $graph_value = $this->getGoogleGraphValue($records, $graph_info, $filter_values);

            return $graph_value;
        }else{
            return NULL;
        }
    }

    public function getGoogleGraphValue($records, $graph_info, $filter_values){

        $data_array = NULL;
        $graph_data = $graph_info;

        foreach($graph_data as $key => $type){
            if($type == ''){
                unset($graph_data[$key]);
            }
        }

        #find label and value fields
        $graph_info['graph_type'] != 'stacked' ? $label_field = 'periood' : $label_field = 'silt';
        $value_field = 'vaartus';
        $graph_info['graph_set'] === 'multi-line' ?  $indicator_field = $graph_data['graph_group_by'] : $indicator_field = 'naitaja';

        if($graph_info['graph_set'] === 'multi'){
            $indicator_field = $graph_data['graph_group_by'];
        }

        if($label_field && $value_field){
            $labelsums = [];
            $xlabels = [];

            #get value for each label, sum reoccurring labels
            foreach($records as $record){

                if(isset($record[$label_field]) && $record[$label_field] != ''){
                    $xlabel = $record[$label_field];
                }else{
                    continue;
                }

                $ylabel = (string)t($label_field);
                $val = $record[$value_field];

                if(isset($record[$indicator_field]) && $record[$indicator_field] != ''){
                    $value_label = $record[$indicator_field];
                }else{
                    continue;
                }

                $labelsums[$ylabel][$xlabel] = $xlabel;
                if(!isset($labelsums[$value_label][$xlabel])){
                    $labelsums[$value_label][$xlabel] = floatval(str_replace(",",".", $val));
                }else{
                    $labelsums[$value_label][$xlabel] += floatval(str_replace(",",".", $val));
                }
                if(!in_array($xlabel, $xlabels)){
                    $xlabels[] = $xlabel;
                }
            }

            if($graph_info['graph_set'] === 'combo'){
                #sort data array by indicators
                #add first fixed row to new array
                $new_labelsums[key($labelsums)] = reset($labelsums);

                #get correct key order by indicator
                $key_order = $filter_values[$indicator_field];

                #put values in new order to the array
                foreach($key_order as $value){
                    $new_labelsums[$value] = $labelsums[$value];
                }

                $labelsums = $new_labelsums;
            }

            #add values to empty fields
            if(count($xlabels) > 0){
                foreach($xlabels as $label){
                    $labelsums = $this->fillEmptyFields($labelsums, $label);
                }
                #add labels for chart
                foreach($labelsums as $label => $value){
                    $data_array[0][] = (string)$label;
                    foreach($value as $key => $val){
                        $data_array[$key][] = round($val);
                    }
                }
                $data_array = array_values($data_array);
            }
        }

        return $data_array != NULL ? json_encode($data_array, TRUE) : NULL;
    }

    public function fillEmptyFields($labelsums, $xlabelval){
        foreach($labelsums as $key => $label){
            if(!isset($label[$xlabelval])){
                $labelsums[$key][$xlabelval] = 0;
            }
        }

        return $labelsums;
    }


    public function applyFilters($row){

        foreach($this->filter_values as $key => $filters){
            $match = false;

            if(isset($row[$key])){
                if(is_array($filters) && count($filters) > 0){
                    foreach($filters as $filter){
                        if ($filter != '' && strpos($row[$key], $filter) !== FALSE) {
                            $match = true;
                        }
                    }
                }else if(count($filters) == 0){
                    $match = true;
                }else{
                    if(strpos($row[$key], $filters) !== FALSE){
                        $match = true;
                    }
                }

                if($match == false){
                    return false;
                }
            }else{
                return false;
            }
        }

        return true;
    }
}
