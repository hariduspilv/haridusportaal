<?php

/**
 * @file
 * Contains \Drupal\htm_custom_xjson_services\Plugin\Field\FieldWidget\JsonbWidget.
 */

namespace Drupal\htm_custom_xjson_services\Plugin\Field\FieldWidget;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextareaWidget;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\Unicode as Unicode;
use Drupal\Component\Serialization\Json as Json;
use Swaggest\JsonSchema\Exception;
use Swaggest\JsonSchema\Schema;

/**
 * Plugin implementation of the 'jsonb_textarea' widget.
 *
 * @FieldWidget(
 *   id = "jsonb_textarea",
 *   label = @Translation("JSONB Object"),
 *   field_types = {
 *     "jsonb",
 *     "json",
 *   }
 * )
 */
class JsonbWidget extends StringTextareaWidget {

    var $errormessages = [];
    var $langs = [];
    var $schemas_path = '';

    /**
     * {@inheritdoc}
     */
    public function formElement (FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
        $id = $items->getName();
        $element['value'] = $element + [
                '#type' => 'textarea',
                '#suffix' => new FormattableMarkup("<div id='$id' style='width: 100%; height: 800px;'></div>", []),
                '#attached' => [
                    'library' => ['htm_custom_xjson_services/myform'],
                    'drupalSettings' => [
                        "$id" =>
                            isset($form_state->getUserInput()[$items->getName()])
                                ? $form_state->getUserInput()[$items->getName()][0]['value']
                                : $items[$delta]->value
                    ]

                ],
                '#element_validate' => [[$this, 'validateJsonStructure']],
                '#attributes' => [
                    'style' => 'display:none',
                ],
            ];
        if (preg_match("/test/", $id)) {
            unset($element['value']['#element_validate']);
        }

        return $element;
    }

    /**
     * Validates the input to see if it is a properly formatted JSON object. If not, PgSQL will throw fatal errors upon insert.
     *
     * @param                                      $element
     * @param \Drupal\Core\Form\FormStateInterface $form_state
     * @param                                      $form
     */
    public function validateJsonStructure (&$element, FormStateInterface $form_state, $form) {
        $this->langs = \Drupal::languageManager()->getLanguages();

        if (Unicode::strlen($element['#value'])) {

            $value = json_decode($element['#value']);
            if($value->header->endpoint === 'HP'){
                $this->schemas_path = "/app/drupal/web/modules/custom/htm_custom_xjson_services/src/Schemas/xJsonForm/Form/";
            }else{
                $this->schemas_path = "/app/drupal/web/modules/custom/htm_custom_xjson_services/src/Schemas/xJson/Form/";
            }

            $schema = file_get_contents($this->schemas_path."xJsonSchema.json");
            $step_schema = file_get_contents($this->schemas_path."stepSchema.json");
            $message_schema = file_get_contents($this->schemas_path."messageSchema.json");


            $schema = Schema::import(json_decode($schema));
            $step_schema = Schema::import(json_decode($step_schema));

            try{
                $schema->in($value);
            }catch(Exception $e){
                $message = $e->getMessage();
                $this->setErrorMessage(t($message));
            }

            if (isset($value->body->steps) && !empty($value->body->steps)) {
                $steps = $value->body->steps;
                $steps_count = count((array)$value->body->steps);
                if (isset($value->header)) {
                    if ($steps_count != $value->header->number_of_steps) $this->setErrorMessage(t('header.number_of_steps and body.steps count is different'));
                }

                foreach ($steps as $step) {
                    try{
                        $step_schema->in($step);
                    }catch(Exception $e){
                        $message = $e->getMessage();
                        $this->setErrorMessage(t($message));
                    }

                    foreach($step->data_elements as $data_element){

                        $this->validateDataElement($data_element);

                        if($data_element->type === 'table'){
                            foreach($data_element->table_columns as $data_field){
                                $this->validateDataElement($data_field);
                            }
                        }
                    }
                }
            }

            if(isset($value->body->messages)){
                $messages = $value->body->messages;

                foreach($messages as $message){
                    try{
                        $message_schema->in($message);
                    }catch(Exception $e){
                        $err_message = $e->getMessage();
                        $this->setErrorMessage(t($err_message));
                    }
                }
            }

            if (!empty($this->getErrorMessages())) $form_state->setError($element, $this->getErrorMessages());
        }
    }

    private function setErrorMessage ($string) {
        $this->errormessages[] = $string;
    }

    private function getErrorMessages () {
        $string = '';
        foreach ($this->errormessages as $message) {
            $string .= $message . " - ";
        }
        return $string;
    }

    private function validateDataElement ($element) {

        $schema_path = $this->schemas_path.$element->type."Schema.json";

        if(file_exists($schema_path)){
            $data_element_schema = file_get_contents($schema_path);

            $data_element_schema = Schema::import(json_decode($data_element_schema));

            try{
                $data_element_schema->in($element);
            }catch(Exception $e){
                $message = $e->getMessage();
                $this->setErrorMessage(t($message));
            }

        }else{
            $this->setErrorMessage(t('Type '.$element->type.' is not supported.'));
        }

    }

    protected function validateOptionElement ($options, $option_keys = [], $step, $parent_key, $key) {
        foreach ($options as $option_key => $option) {
            $option_keys[] = $option_key;
            $this->checkTextLanguages($option, "$step.data_elements.$parent_key.$key Option text");
            if (isset($option['options'])) $this->validateOptionElement($option['options'], $option_keys, $step, $parent_key, $key);
        }
        return $option_keys;
    }
}
