<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\TypedData\DataDefinitionInterface;
use Drupal\Core\TypedData\TypedData;
use Drupal\Core\TypedData\TypedDataInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItem;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;

/**
 * Class GoogleChartValue
 * @package Drupal\htm_custom_oska
 */
class GoogleChartValue extends TypedData {

    /**
     * {@inheritdoc}
     */
    public function getValue() {

        /** @var \Drupal\Core\Field\FieldItemInterface $item */
        $item = $this->getParent();
        $graph_info = json_decode($item->getValue()['filter_values'], TRUE);
        $condition_count = 0;
        $target_type = $item->getFieldDefinition()->getSettings()['target_type'];
        $filter_values = $graph_info;

        foreach($graph_info as $key => $value){
            if($key != 'graph_type' && $key != 'secondary_graph_type'){
                $filter_values[$key] = $value;
                unset($graph_info[$key]);
            }else{
                unset($filter_values[$key]);
            }
        }


        $query = \Drupal::entityQuery($target_type);

        foreach($filter_values as $key => $filter){
            if(isset($filter[0]['target_id'])){
                $search_args = $this->cleanFilters($filter);
                if($search_args != NULL){
                    $query->condition($key.'.target_id', $search_args, 'IN');
                    $condition_count++;
                }
            }else{
                if(count($filter) > 0){
                    $query->condition($key, $filter, 'IN');
                    $condition_count++;
                }
            }
        }

        if($condition_count > 0){
            $entity_ids = $query->execute();
        }
        if(isset($entity_ids)){
            $entities = \Drupal::entityTypeManager()->getStorage($target_type)->loadMultiple($entity_ids);
            $graph_value = $this->getGoogleGraphValue($entities, $graph_info, $filter_values);

            return $graph_value;
        }else{
            return NULL;
        }
    }

    /**
     * {@inheritdoc}
     */
    public function setValue($value, $notify = TRUE) {
        $this->date = $value;
        // Notify the parent of any changes.
        if ($notify && isset($this->parent)) {
            $this->parent->onChange($this->name);
        }
    }

    public function getGoogleGraphData($graph_info){

    }

    public function cleanFilters($filters){
        foreach($filters as $filter){
            $cleaned_filters[] = $filter['target_id'];
        }
        return $cleaned_filters;
    }

    public function getGoogleGraphValue($entities, $graph_info, $filter_values){
        foreach($graph_info as $key => $type){
            if($type == ''){
                unset($graph_info[$key]);
            }
        }

        #get entity fields for finding label and value fields
        $entity_fields = reset($entities)->getFields();

        #find label and value fields
        foreach($entity_fields as $key => $field){
            if(isset($field->getSettings()['graph_label'])){
                $label_field = $key;
            }
            if(isset($field->getSettings()['graph_value'])){
                $value_field = $key;
            }
        }
        if($label_field && $value_field){
            $labelsums = [];
            #get value for each label, sum reoccurring labels
            foreach($entities as $entity){
                $labelval = $entity->$label_field->value;
                $val = $entity->$value_field->value;
                $year = $entity->year->value;
                if($graph_info['graph_type'] == 'scatter'){
                    $yearint = intval($year);
                    $labelsums['year'][$year] = $yearint;
                }else{
                    $labelsums['year'][$year] = $year;
                }
                if(!isset($labelsums[$labelval][$year])){
                    $labelsums[$labelval][$year] = intval($val);
                }else{
                    $labelsums[$labelval][$year] += intval($val);
                }


            }

            #add labels for chart
            foreach($labelsums as $label => $value){
                $data_array[0][] = $label;
                foreach($value as $key => $val){
                    $data_array[$key][] = $val;
                }
            }
            $data_array = array_values($data_array);
        }else{
            return FALSE;
        }

        return json_encode($data_array, TRUE);
    }
}