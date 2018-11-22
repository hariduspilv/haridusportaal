<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\TypedData\DataDefinitionInterface;
use Drupal\taxonomy\Entity\Term;
use Drupal\Core\TypedData\TypedData;
use Drupal\Core\TypedData\TypedDataInterface;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItem;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItemInterface;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\Core\StringTranslation\TranslatableMarkup;

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
        $filter_values = $graph_info['graph_options'];



        foreach($graph_info['graph_options'] as $key => $value){
            if($key != 'graph_title' && $key != 'graph_type' && $key != 'graph_v_axis' && $key != 'secondary_graph_type' && $key != 'graph_group_by'){
                $filter_values[$key] = $value;
                unset($graph_info['graph_options'][$key]);
            }else{
                unset($filter_values[$key]);
            }
        }

        if(isset($filter_values['secondary_graph_indicator'])){

            $entity = \Drupal::entityTypeManager()->getStorage($target_type)->loadMultiple();
            $entity = reset($entity);

            foreach($entity->getFields() as $key => $field){
                $field_settings = $field->getSettings();
                if(isset($field_settings['graph_indicator'])){
                    $indicator_field = $key;
                }
            }
            $filter_values[$indicator_field][] = reset($filter_values['secondary_graph_indicator']);
            unset($filter_values['secondary_graph_indicator']);
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

    public function cleanFilters($filters){
        foreach($filters as $filter){
            $cleaned_filters[] = $filter['target_id'];
        }
        return $cleaned_filters;
    }

    public function getGoogleGraphValue($entities, $graph_info, $filter_values){

        $data_array = NULL;
        $graph_data = $graph_info['graph_options'];

        foreach($graph_data as $key => $type){
            if($type == ''){
                unset($graph_data[$key]);
            }
        }

        #get entity fields for finding label and value fields
        if(count($entities) > 0){
            $entity_fields = reset($entities)->getFields();

            #find label and value fields

            $label_field = $graph_data['graph_v_axis'];
            foreach($entity_fields as $key => $field){
                $field_settings = $field->getSettings();
                if(isset($field_settings['graph_value'])){
                    $value_field = $key;
                }
                if(isset($field_settings['graph_indicator'])){
                    $indicator_field = $key;
                }
            }
            if($graph_info['graph_set'] === 'multi'){
                $indicator_field = $graph_data['graph_group_by'];
            }

            if($label_field && $value_field){
                $labelsums = [];
                $xlabels = [];

                #get value for each label, sum reoccurring labels
                foreach($entities as $entity){
                    $entity_value = $entity->toArray();
                    if($entity->$label_field->value != NULL){
                        $xlabel = $entity->$label_field->value;
                    }else{
                        if(isset($entity_value[$label_field][0]['target_id']) && $entity_value[$label_field][0]['target_id'] != 0){
                            $xlabel = Term::load($entity_value[$label_field][0]['target_id'])->getName();
                        }else{
                            continue;
                        }
                    }


                    $ylabel = (string)$this->t($entity->$label_field->getFieldDefinition()->getLabel()->getUntranslatedString());
                    $val = $entity->$value_field->value;

                    if(isset($entity_value[$indicator_field][0]['target_id']) && $entity_value[$indicator_field][0]['target_id'] != 0){
                        $value_label = Term::load($entity_value[$indicator_field][0]['target_id'])->getName();
                    }elseif(isset($entity_value[$indicator_field][0]['value']) && $entity_value[$indicator_field][0]['value'] != ''){
                        $value_label = $entity_value[$indicator_field][0]['value'];
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

                #add x-axis value to order array as first
                $key_order[] = key($labelsums);

                #get correct order for indicators
                foreach($filter_values[$indicator_field] as $value){
                    $key_order[] = Term::load($value['target_id'])->getName();
                }

                #create new array with correct order and values from old array
                foreach($key_order as $key){
                    $new_labelsums[$key] = $labelsums[$key];
                }

                $labelsums = $new_labelsums;

                #add values to empty fields
                if(count($xlabels) > 0){
                    foreach($xlabels as $label){
                        $labelsums = $this->fillEmptyFields($labelsums, $label);
                    }
                    #add labels for chart
                    foreach($labelsums as $label => $value){
                        $data_array[0][] = (string)$label;
                        foreach($value as $key => $val){
                            $data_array[$key][] = $val;
                        }
                    }
                    $data_array = array_values($data_array);
                }
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
}