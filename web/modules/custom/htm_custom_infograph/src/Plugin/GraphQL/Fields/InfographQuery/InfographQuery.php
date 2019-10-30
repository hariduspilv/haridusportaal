<?php

namespace Drupal\htm_custom_infograph\Plugin\GraphQL\Fields\InfographQuery;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GraphQL\Type\Definition\ResolveInfo;
use Drupal\graphql\GraphQL\Buffers\SubRequestBuffer;
use League\Csv\Reader;
use League\Csv\Statement;

/**
 * @GraphQLField(
 *   id = "infograph_query",
 *   secure = true,
 *   type = "[Infograph]",
 *   name = "InfographQuery",
 *   arguments = {
 *     "filters" = "InfographFilterInput",
 *   }
 * )
 */
class InfographQuery extends FieldPluginBase {

  /**
   * {@inheritdoc}
   */
  public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {

    $value['ChartValue'] = $this->getChartValue($args);

    yield $value;
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

    $cache[0]->setCacheTags([$args['filters']['file'].'_csv']);

    return $cache;
  }

  public function getChartValue($args){

    $graph_info = $args['filters'];

    $filter_values = $graph_info;
    $graph_info_fields = [
      'file',
      'graph_set',
      'graph_type',
      'secondary_graph_type',
      'graph_group_by',
      'graph_v_axis'
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
      foreach($filter_values['secondary_graph_indicator'] as $value){
        $filter_values['indicator'][] = $value;
      }
      unset($filter_values['secondary_graph_indicator']);
    }

    $filter_values['naitaja'] = $filter_values['indicator'];
    unset($filter_values['indicator']);

    $this->filter_values = $filter_values;

    $reader = Reader::createFromPath('/app/drupal/web/sites/default/files/private/infograph/'.$graph_info['file'].'.csv', 'r');
    $reader->setDelimiter(';');
    $reader->setHeaderOffset(0);
    $stmt = (new Statement())
      ->where([$this,'applyFilters']);

    $records = iterator_to_array($stmt->process($reader), false);

    if(isset($records) && count($records) > 0){
      $graph_value = $this->formResponse($records, $graph_info, $filter_values);

      return $graph_value;
    }else{
      return NULL;
    }
  }

  public function formResponse($records, $graph_info, $filter_values){

    $data_array = NULL;
    $graph_data = $graph_info;

    foreach($graph_data as $key => $type){
      if($type == ''){
        unset($graph_data[$key]);
      }
    }

    #find label and value fields
    $label_field = $graph_data['graph_v_axis'];
    $value_field = 'vaartus';

    $indicator_field = $graph_data['graph_group_by'];

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
          $labelsums[$value_label][$xlabel] = empty($val) ? null : floatval(str_replace(",",".", $val));
        }else{
          $labelsums[$value_label][$xlabel] += empty($val) ? null : floatval(str_replace(",",".", $val));
        }
        if(!in_array($xlabel, $xlabels)){
          $xlabels[] = $xlabel;
        }
      }

      if($indicator_field == 'naitaja'){
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
            $data_array[$key][] = is_string($val) || $val === null ? $val : round($val, 2);
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
        $labelsums[$key][$xlabelval] = json_decode('null');
      }
    }

    return $labelsums;
  }


  public function applyFilters($row){

    foreach($this->filter_values as $key => $filters){
      $match = true;

      if(isset($row[$key])){
        if(is_array($filters) && count($filters) > 0){
          if(!in_array($row[$key], $filters)){
            $match = false;
            break;
          }
        }else if(count($filters) == 0){
          $match = true;
        }else{
          if(strpos($row[$key], $filters) == FALSE){
            $match = false;
            break;
          }
        }
      }else{
        $match = false;
        break;
      }
    }

    return $match;
  }
}
