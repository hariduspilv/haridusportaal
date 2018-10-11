<?php
namespace Drupal\htm_custom_xjson_services;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\user\Entity\User;
use GuzzleHttp\Exception\BadResponseException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Drupal\redis\ClientFactory;
/**
 * Class xJsonService.
 */
class xJsonService implements xJsonServiceInterface {

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
	 * @param AccountProxyInterface $current_user
	 * @param RequestStack $request_stack
	 * @param EntityTypeManagerInterface $entityTypeManager
	 */
	public function __construct(AccountProxyInterface $current_user, RequestStack $request_stack, EntityTypeManagerInterface $entityTypeManager, EhisConnectorService $ehisConnectorService) {
    $this->currentUser = $current_user;
    $this->currentRequestContent = json_decode($request_stack->getCurrentRequest()->getContent());
    $this->entityTypeManager = $entityTypeManager;
    $this->ehisconnector = $ehisConnectorService;
  }

	public function getxJsonHeader(){
		return (!empty($this->getEntityJsonObject())) ? $this->getEntityJsonObject()['header'] : [];
	}

	public function getxJsonBody(){
		return $this->getEntityJsonObject()['body'];
	}

	public function getxJsonMessages(){
		return $this->getEntityJsonObject()['messages'];
	}


	public function getBasexJsonForm($first = FALSE, $response_info = [], $form_name = NULL){
		$baseJson = [];
		if($first && !empty($this->getEntityJsonObject($form_name))){
			$definition_header = $this->getxJsonHeader();
			$baseJson['header'] = $definition_header +[
				'first' => TRUE,
				'current_step' => null,
				'identifier' => null,
				'acceptable_activity' => ['CONTINUE'],
				'agents' => [
					['person_id' => $this->getCurrentUserIdCode(), 'role' => 'TAOTLEJA']
				]
			];

			/*TODO fix empty arrays*/
			$baseJson['body'] = [
				'steps' => ['empty' => 'empty'],
				'messages' => []
			];

			/*TODO fix empty arrays*/
			$baseJson['messages'] = ['empty' => 'empty'];

		} elseif(!empty($response_info) && !empty($this->getEntityJsonObject($form_name))){
			$baseJson = $response_info;
			unset($baseJson['header']['first']);
			$definition_header = $this->getxJsonHeader();
			// set definition header and add server-side idCode
			$baseJson['header'] = $definition_header + [
				'agents' => [
					['person_id' => $this->getCurrentUserIdCode(), 'role' => 'TAOTLEJA']
				]
			] + $baseJson['header'];
			#dump($response_info);
		}
		#dump($baseJson);
		return $baseJson;
	}

	/**
	 * @return mixed
	 */
	protected function getFormNameFromRequest(){
		return $this->currentRequestContent->form_name;
	}

	/**
	 * @param null $form_name
	 * @return mixed|null
	 * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
	 * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
	 */
	public function getEntityJsonObject($form_name = NULL){
		$id = (!$form_name) ? $this->getFormNameFromRequest() : $form_name;
		$entityStorage = $this->entityTypeManager->getStorage('x_json_entity');

		$connection = \Drupal::database();
		$query = $connection->query("SELECT id FROM x_json_entity WHERE xjson_definition->'header'->>'form_name' = :id", array(':id' => $id));
		$result = $query->fetchField();
		if($result){
			$entity = $entityStorage->load($result);
			return ($entity) ? Json::decode($entity->get('xjson_definition')->value) : NULL;
		}else{
			return NULL;
		}

	}

	/**
	 * @return mixed
	 */
	protected function getCurrentUserIdCode(){
		return User::load($this->currentUser->id())->field_user_idcode->value;
	}

	/**
	 * @param $response
	 * @return array
	 * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
	 * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
	 */
	public function buildFormv2($response){
		$return = [];
		#dump($response);
		$response_body = isset($response['body']) ? $response['body'] : NULL;
		$response_header = isset($response['header']) ? $response['header'] : NULL;
		$response_messages = isset($response['messages']) ? $response['messages'] : NULL;

		$this->validatexJsonHeader($response_header);
		$form_name = $response['header']['form_name'];
		$definition = $this->getEntityJsonObject($form_name);
		$definition_body = $definition['body'];
		
		$return['messages'] = ($definition['messages']) ? $definition['messages'] : [] ;		
			
		if($response_header) $return['header'] = $response_header;
		if($response_messages) $return['messages'] += $response_messages;
		
		if($response_body && !empty($response_body['steps'])){
			foreach($definition_body['steps'] as $step_key => $step){
				if(isset($response_body['steps'][$step_key])){
					foreach($definition_body['steps'][$step_key]['data_elements'] as $element_key => $element){
						$return_element = $element;
						#if(isset($response_body['steps'][$step_key]['data_elements'][$element_key])){
							$response_element = $response_body['steps'][$step_key]['data_elements'][$element_key];
							if(!empty($this->mergeElementValue($element, $response_element))) {
								$return_element = $this->mergeElementValue($element, $response_element);
							}
						#}
						$return['body']['steps'][$step_key]['data_elements'][$element_key] = $return_element;
					}
					//Add step non data_elements
					unset($definition_body['steps'][$step_key]['data_elements']);
					$return['body']['steps'][$step_key] += $definition_body['steps'][$step_key];
					// add each step messages aswel
					if(isset($response_body['steps'][$step_key]['messages'])){
						#dump($response_body['steps'][$step_key]['messages']);
						$return['body']['steps'][$step_key]['messages'] = $response_body['steps'][$step_key]['messages'];
					}else{
						$return['body']['steps'][$step_key]['messages'] = [];
					}
				}else{
					// add all other steps aswel
					$return['body']['steps'][$step_key] = $step['title'];
				}
			}
			#unset($response_body['steps']);
			#dump($response_body);
			if($response_body['messages']){
				#dump($response_body['messages']);
				$return['body']['messages'] = $response_body['messages'];
			}else{
				$return['body']['messages'] = [];
			}
		}else{
			$return['body'] = $response_body;
		}
		//Add body information
		unset($definition_body['steps']);
		$return['body'] += $definition_body;
		return $return;
	}


	/**
	 * @param $header
	 */
	public function validatexJsonHeader($header){
		$required_keys = ['form_name', 'endpoint'];
		$acceptable_activity_keys = ['SAVE', 'SUBMIT', 'VIEW'];

		#if(!$header['first']) array_push($required_keys, ...['identifier', 'acceptable_activity']);
		foreach ($required_keys as $key){
			if(!$header[$key]) throw new HttpException('400', "$key missing");
			if(!$header['first']){
				foreach($acceptable_activity_keys as $acceptable_activity_key){
					if(!in_array($aa = $acceptable_activity_key, $acceptable_activity_keys))throw new HttpException("400","acceptable_activity $aa value not acceptable");
				}
			}
		}
	}

	public function mergeElementValue($element_def, $value){
		$element_type = $element_def['type'];

		if($element_type === 'table'){
			$element_column_keys = array_keys($element_def['table_columns']);
			foreach($value['value'] as $item){
				foreach ($item as $table_key => $element){
					if(!in_array($table_key, $element_column_keys)){
						throw new HttpException('400', "$table_key missing from table definition");
					}
				}
			}
		}

		if(is_array($value)){
			$element_def += $value;
		}else{
			$element_def['value'] = $value;
		}

		//Sort table values
		if($element_type === 'table') $element_def = $this->sortTableValues($element_def);
		#dump($element_def);
		return ($this->validateDataElement($element_def)) ? $element_def : [];
	}

	public function validateDataElement(&$element, $table = false){
		$valid = true;
		$element_type = $element['type'];
		$default_acceptable_keys = ['type', 'title', 'helpertext', 'required', 'hidden', 'readonly', 'default_value', 'value'];
		$additional_keys = [];
		switch ($element_type){
			case 'heading':
			case 'helpertext':
				$acceptable_keys = ['type', 'title'];
				break;
			case 'text':
				$additional_keys = ['width', 'maxlength', 'minlength'];
				break;
			case 'textarea':
				$additional_keys = ['width', 'height', 'maxlength', 'minlength'];
				break;
			case 'date':
				if($table) $additional_keys = ['width', 'min', 'max'];
				else $additional_keys = ['min', 'max'];
				break;
			case 'number':
				if($table) $additional_keys = ['width', 'min', 'max'];
				else $additional_keys = ['min', 'max'];
				break;
			case 'selectlist':
				if($table) $additional_keys = ['width', 'multiple', 'empty_option', 'options'];
				else $additional_keys = ['multiple', 'empty_option', 'options', 'options_list'];
				if(isset($element['options_list'])){
					$params['hash'] = $element['options_list'];
					$element['options'] = $this->ehisconnector->getOptionsTaxonomy($params);
				}

				$recfunc = function($options, $keys = []) use (&$recfunc) {
					foreach($options as $key => $option){
						$keys[] = $key;
						if($option['options']){
							return $recfunc($option['options'], $keys);
						}
					}
					return $keys;
				};

				$option_keys = $recfunc($element['options']);
				/*TODO check also if value is array*/
				if($element['value']){
					if(is_array($element['value'])){
						foreach($element['value'] as $value){
							if(!in_array($value, $option_keys)) $valid = false;
						}
					}else{
						if(!in_array($element['value'], $option_keys)) $valid = false;
					}
				}

				break;
			case 'file':
				if($table) $additional_keys = ['width', 'acceptable_extensions'];
				else $additional_keys = ['multiple', 'acceptable_extensions'];
				/*TODO File check if array aswel*/
				if($element['value']){
					if(is_array($element['value'])){
						foreach($element['value'] as $value){
							if(!$value['file_name'] || !$value['file_identifier']){
								$valid = false;
							}
						}
					}else{
						if(!$element['value']['file_name'] || !$element['value']['file_identifier']){
							$valid = false;
						}
					}
				}
				break;
			case 'table':
				$additional_keys = ['add_del_rows', 'table_columns'];
				if(isset($element['add_del_rows']) && !is_bool($element['add_del_rows'])) $valid = false;
				if(isset($element['table_columns'])){
					foreach($element['table_columns'] as $key => $column_element){
						if(($is_table = $column_element['type'] === 'table') || ($is_textarea = $column_element['type'] === 'textarea')){
							if(isset($is_table) && $is_table) $valid = false;
							if(isset($is_textarea) && $is_textarea) $valid = false;
						}else{
							if(!$this->validateDataElement($column_element, TRUE)) $valid = false;
						}
					}
				}else{
					$valid = false;
				}
				break;
			case 'address':
				$additional_keys = ['multiple'];
				break;
			case 'checkbox':
				$additional_keys = ['width'];
				break;
			case 'email':
				$additional_keys = [];
				break;
			default:
				throw new HttpException('400', 'some error');
				break;
		}

		if(!isset($acceptable_keys)) $acceptable_keys = array_merge($default_acceptable_keys, $additional_keys);
		$element_keys = array_keys($element);
		foreach($element_keys as $element_key){
			if(!in_array($element_key, $acceptable_keys, TRUE)) $valid = false; continue;
		}
		return $valid;
	}

	public function buildTestResponse(){
		$id = $this->getFormNameFromRequest();
		$entityStorage = $this->entityTypeManager->getStorage('x_json_entity');

		$connection = \Drupal::database();
		$query = $connection->query("SELECT id FROM x_json_entity WHERE xjson_definition_test->'header'->>'form_name' = :id", array(':id' => $id));
		$result = $query->fetchField();
		if($result){
			$entity = $entityStorage->load($result);
			#dump($entity->get('xjson_definition_test')->value);
			return $this->buildFormv2(Json::decode($entity->get('xjson_definition_test')->value));
		}else{
			return NULL;
		}
	}

	protected function sortTableValues($table_element){

		$table_cols = array_keys($table_element['table_columns']);
		#dump($table_element['value']);
		if(is_array($table_element['value'])){
			foreach($table_element['value'] as &$value){
				$properOrderedArray = array_merge(array_flip($table_cols), $value);
				$keys = array_keys(array_diff_key(array_flip($table_cols), $value));
				$value = $properOrderedArray;
				foreach ($keys as $key) $value[$key] = NULL;
			}
		}
		return $table_element;
	}

	public function searchDefinitionElement($key, $array, $form_name = NULL){
		$results = [];
		if($form_name) $array = $this->getEntityJsonObject($form_name);
		if (is_array($array)) {
			if (isset($array[$key])) {
				$results[] = $array[$key];
			}
			foreach ($array as $subArray) {
				$results = array_merge($results, $this->searchDefinitionElement($key, $subArray));
			}
		}
		return $results;
	}

	public function returnErrorxDzeison()
	{
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
