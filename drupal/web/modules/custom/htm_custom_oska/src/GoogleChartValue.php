<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\TypedData\TypedData;
use League\Csv\Reader;
use League\Csv\Statement;

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
        $graph_info_fields = [
            'graph_title',
            'graph_type',
            'graph_v_axis',
            'secondary_graph_type',
            'graph_group_by',
            'graph_text'
        ];

        foreach($graph_info['graph_options'] as $key => $value){
            if(!in_array($key, $graph_info_fields)){
                $filter_values[$key] = $value;
                unset($graph_info['graph_options'][$key]);
            }else{
                unset($filter_values[$key]);
            }
        }

        if(isset($filter_values['secondary_graph_indicator'])){
            $filter_values['graph_indicator'] = [$filter_values['graph_indicator'], $filter_values['secondary_graph_indicator']];
            unset($filter_values['secondary_graph_indicator']);
        }

        $filter_values['naitaja'] = $filter_values['graph_indicator'];
        unset($filter_values['graph_indicator']);

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

    public function getGoogleGraphValue($records, $graph_info, $filter_values){

        $data_array = NULL;
        $graph_data = $graph_info['graph_options'];

        foreach($graph_data as $key => $type){
            if($type == ''){
                unset($graph_data[$key]);
            }
        }

        #find label and value fields
        $label_field = $graph_data['graph_v_axis'];
        $value_field = 'vaartus';

        if($graph_info['graph_set'] === 'multi' || $graph_info['graph_set'] === 'multi-line'){
            $indicator_field = $graph_data['graph_group_by'];
        }else{
            $indicator_field = 'naitaja';
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

                $ylabel = (string)$this->t($label_field);
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
                        if (strpos($row[$key], $filter) !== FALSE) {
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