<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;
use League\Csv\Exception;
use League\Csv\Writer;
use League\Csv\Reader;

/**
 * Form controller for xJson form entity edit forms.
 *
 * @ingroup htm_custom_xjson_services
 */
class xJsonFormEntityForm extends ContentEntityForm {

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state) {
        /* @var $entity \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntity */
        $form = parent::buildForm($form, $form_state);

        if (!$this->entity->isNew()) {
            $form['new_revision'] = [
                '#type' => 'checkbox',
                '#title' => $this->t('Create new revision'),
                '#default_value' => FALSE,
                '#weight' => 10,
            ];
        }

        $entity = $this->entity;

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function save(array $form, FormStateInterface $form_state) {
        $entity = $this->entity;

        // Save as a new revision if requested to do so.
        if (!$form_state->isValueEmpty('new_revision') && $form_state->getValue('new_revision') != FALSE) {
            $entity->setNewRevision();

            // If a new revision is created, save the current user as revision author.
            $entity->setRevisionCreationTime(REQUEST_TIME);
            $entity->setRevisionUserId(\Drupal::currentUser()->id());
        }
        else {
            $entity->setNewRevision(FALSE);
        }

        $status = parent::save($form, $form_state);

        switch ($status) {
            case SAVED_NEW:
                drupal_set_message($this->t('Created the %label xJson form entity.', [
                    '%label' => $entity->label(),
                ]));
                break;

            default:
                drupal_set_message($this->t('Saved the %label xJson form entity.', [
                    '%label' => $entity->label(),
                ]));
        }
        $form_state->setRedirect('entity.x_json_form_entity.canonical', ['x_json_form_entity' => $entity->id()]);

        // create csv if it doesn't exist
        $this->setupFormCSV();
    }

    private function setupFormCSV(){

        $headers = $this->getDefinitionHeaders();

        $result_csv_path = "/app/drupal/web/sites/default/files/private/xJsonCSVs";
        if(!file_exists($result_csv_path)) mkdir($result_csv_path, 0744, true);
        $result_csv_path .= '/'.$this->entity->id().'.csv';
        if(!file_exists($result_csv_path)){
            $this->createFileWithHeaders($headers, $result_csv_path);
        }else{
            $reader = Reader::createFromPath($result_csv_path, 'r');
            $reader->setHeaderOffset(0);
            try{
                $response = $reader->getHeader();
                $current_header = explode(';', $response[0]);
            }catch(Exception $e){
                $current_header = [];
            }

            $result = array_merge(array_diff($headers, $current_header), array_diff($current_header, $headers));
            if(count($result) > 0){
                $this->changeFileHeaders($headers, $result_csv_path);
            }

        }
    }

    private function createFileWithHeaders($headers, $path){
        $writer = Writer::createFromPath($path, 'w+');
        $writer->setDelimiter(';');
        $writer->insertOne($headers);
    }

    private function createUpdatedFile($headers, $records, $path){
        $writer = Writer::createFromPath($path, 'w+');
        $writer->setDelimiter(';');
        $writer->insertOne($headers);
        $writer->insertAll($records);
    }

    private function changeFileHeaders($headers, $path){
        $reader = Reader::createFromPath($path, 'r');
        $reader->setDelimiter(';');
        $reader->setHeaderOffset(0);

        $current_records = $reader->getRecords();
        foreach($current_records as $record){
            foreach($headers as $header){
                if(isset($record[$header])){
                    $new_record[$header] = $record[$header];
                }else{
                    $new_record[$header] = '';
                }
            }
            $new_records[] = $new_record;
        }

        $this->createUpdatedFile($headers, $new_records, $path);
    }

    private function getDefinitionHeaders(){
        $schemas_path = "/app/drupal/web/modules/custom/htm_custom_xjson_services/src/Schemas/xJsonForm/Value/";
        $headers = [];
        $data_elements = [];

        $steps = json_decode($this->entity->get('xjson_definition')->value, TRUE)['body']['steps'];

        // get all possible data_elements
        foreach($steps as $step){
            $data_elements = array_merge($step['data_elements'], $data_elements);
        }

        // check if each data element holds value
        foreach($data_elements as $element_label => $element){
            if(file_exists($schemas_path.$element['type']."Schema.json")){
                $headers[] = $element_label;
            }
        }

        return $headers;
    }
}