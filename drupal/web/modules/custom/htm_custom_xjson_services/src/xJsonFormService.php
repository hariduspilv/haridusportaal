<?php

namespace Drupal\htm_custom_xjson_services;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\RequestStack;
use Swaggest\JsonSchema\Exception;
use Swaggest\JsonSchema\Schema;
use League\Csv\Writer;
use League\Csv\Reader;

/**
 * Class xJsonService.
 */
class xJsonFormService implements xJsonServiceInterface {

    /**
     * Drupal\Core\Session\AccountProxyInterface definition.
     *
     * @var \Drupal\Core\Session\AccountProxyInterface
     */
    protected $currentUser;

    /**
     * @var array
     */
    protected $currentRequestContent;

    /**
     * The entity type manager.
     *
     * @var \Drupal\Core\Entity\EntityTypeManagerInterface
     */
    protected $entityTypeManager;

    #protected $ehisconnector;

    /**
     * xJsonService constructor.
     *
     * @param AccountProxyInterface      $current_user
     * @param RequestStack               $request_stack
     * @param EntityTypeManagerInterface $entityTypeManager
     */
    public function __construct (AccountProxyInterface $current_user, RequestStack $request_stack, EntityTypeManagerInterface $entityTypeManager) {
        $this->currentUser = $current_user;
        $this->currentRequestContent = json_decode($request_stack->getCurrentRequest()->getContent());
        $this->entityTypeManager = $entityTypeManager;
    }

    public function getxJsonHeader () {
        return (!empty($this->getEntityJsonObject())) ? $this->getEntityJsonObject()['header'] : [];
    }

    public function getxJsonBody () {
        return $this->getEntityJsonObject()['body'];
    }

    public function getxJsonMessages () {
        return $this->getEntityJsonObject()['messages'];
    }


    public function getBasexJsonForm ($first = false, $response_info = [], $form_name = null) {
        $baseJson = [];

        return $baseJson;
    }

    public function getXJsonFormDefinition($data){

        $xjson_definition = $this->getEntityJsonObject($data['form_name']);

        if(!empty($xjson_definition)){
            $xjson_definition['header']['identifier'] = '0';
            $xjson_definition['header']['current_step'] = '1';
            $xjson_definition['header']['acceptable_activity'] = 'SUBMIT';
        }

        return $xjson_definition;
    }

    public function postXJsonFormValues($data){

        // validate posted values
        $valid = $this->validateFormValues($data);
        if($valid){
            $this->postValuesToCSV($data);
        }else{
            return false;
        }

        return true;
    }

    public function validateFormValues($data){
        $this->schemas_path = "/app/drupal/web/modules/custom/htm_custom_xjson_services/src/Schemas/Value/";
        $valid = true;

        // get xJson definition for validation
        $definition = $this->getEntityJsonObject();
        $definition_steps = $definition['body']['steps'];

        $steps = $data['form_info']['body']['steps'];

        // look through steps and validate data inside them
        foreach($steps as $step_key => $step){
            foreach($step['data_elements'] as $field_name => $value){
                $data_type = $definition_steps[$step_key]['data_elements'][$field_name]['type'];
                $valid = $this->validateDataElement($data_type, $value);
                if(!$valid){
                    return $valid;
                }
            }
        }

        return $valid;
    }

    private function validateDataElement ($type, $value) {

        $schema_path = $this->schemas_path.$type."Schema.json";

        if(file_exists($schema_path)){
            $data_element_schema = file_get_contents($schema_path);

            $data_element_schema = Schema::import(json_decode($data_element_schema));

            try{
                $data_element_schema->in(json_decode(json_encode($value), FALSE));
            }catch(Exception $e){
                return false;
            }

        }else{
            return false;
        }

        return true;
    }

    /**
     * @return mixed
     */
    protected function getFormNameFromRequest () {
        return $this->currentRequestContent->form_name;
    }

    /**
     * @return mixed
     */
    protected function getEndpointFromRequest () {
        return $this->currentRequestContent->endpoint;
    }

    /**
     * @param null $form_name
     * @return mixed|null
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
     */
    public function getEntityJsonObject ($form_name = null) {
        $id = (!$form_name) ? $this->getFormNameFromRequest() : $form_name;
        $entityStorage = $this->entityTypeManager->getStorage('x_json_form_entity');

        $connection = \Drupal::database();
        $query = $connection->query("SELECT id FROM x_json_form_entity WHERE xjson_definition->'header'->>'form_name' = :id ", [':id' => $id]);
        $result = $query->fetchField();
        if ($result) {
            $this->entity = $entityStorage->load($result);
            return ($this->entity) ? Json::decode($this->entity->get('xjson_definition')->value) : null;
        } else {
            return null;
        }

    }

    /**
     * @return mixed
     */
    protected function getCurrentUserIdCode () {
        return User::load($this->currentUser->id())->field_user_idcode->value;
    }

    public function postValuesToCSV($data){

        $csv_path  = "/app/drupal/web/sites/default/files/private/xJsonCSVs/".$this->entity->id().".csv";

        $values = $this->getInputValues($data);

        $writer = Writer::createFromPath($csv_path, 'a+');
        $reader = Reader::createFromPath($csv_path, 'r');
        $writer->setDelimiter(';');
        $headers = explode(";", $reader->fetchOne()[0]);
        foreach($headers as $key => $header){
            $ordered_values[$key] = $values[$header];
        }
        $writer->insertOne($ordered_values);

    }

    protected function getInputValues($data){

        $input_values = [];

        $steps = $data['form_info']['body']['steps'];

        foreach($steps as $step){
            $input_values = array_merge($input_values, $step['data_elements']);
        }

        // clean input values
        foreach($input_values as $key => $value){
            $input_values[$key] = $value['value'];
        }

        return $input_values;
    }

    public function returnErrorxDzeison () {
        $json = [
            'header' => [
                'form_name' => 'error',
                'endpoint' => null,
                'number_of_steps' => 1,
                'acceptable_activity' => ['VIEW'],
                'current_step' => 'errorstep',
                'identifier' => null,
            ],
            'body' => [
                'title' => [
                    'et' => 'Viga',
                    'en' => 'Error'
                ],
                'steps' => [
                    'errorstep' => [
                        'title' => [
                            'et' => 'Viga',
                            'en' => 'Error'
                        ]
                    ]
                ]
            ]
        ];

        return $json;
    }


}
