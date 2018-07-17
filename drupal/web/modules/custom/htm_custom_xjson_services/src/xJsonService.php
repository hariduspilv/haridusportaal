<?php
namespace Drupal\htm_custom_xjson_services;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\HttpException;

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


	/**
	 * xJsonService constructor.
	 * @param AccountProxyInterface $current_user
	 * @param RequestStack $request_stack
	 * @param EntityTypeManagerInterface $entityTypeManager
	 */
	public function __construct(AccountProxyInterface $current_user, RequestStack $request_stack, EntityTypeManagerInterface $entityTypeManager) {
    $this->currentUser = $current_user;
    $this->currentRequestContent = json_decode($request_stack->getCurrentRequest()->getContent());
    $this->entityTypeManager = $entityTypeManager;
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


	public function getBasexJsonForm($first = FALSE, $response_info = []){
		$baseJson = [];
		if($first && !empty($this->getEntityJsonObject())){
			$definition_header = $this->getxJsonHeader();
			$baseJson['header'] = $definition_header +[
				'current_step' => null,
				'identifier' => null,
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

		} elseif(!empty($response_info) && !empty($this->getEntityJsonObject())){
			$baseJson = $response_info;
			$definition_header = $this->getxJsonHeader();
			// set definition header and add server-side idCode
			$baseJson['header'] = $definition_header = [
				'agents' => [
					['person_id' => $this->getCurrentUserIdCode(), 'role' => 'TAOTLEJA']
				]
			] + $baseJson['header'];
		}

		return $baseJson;
	}

	/**
	 * @return mixed
	 */
	protected function getFormNameFromRequest(){
		return $this->currentRequestContent->form_name;
	}

	/**
	 * @return mixed|null
	 * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
	 * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
	 */
	protected function getEntityJsonObject(){
		$entityStorage = $this->entityTypeManager->getStorage('x_json_entity');
		$connection = \Drupal::database();
		$query = $connection->query("SELECT id FROM x_json_entity WHERE xjson_definition->'header'->>'form_name' = :id", array(':id' => $this->getFormNameFromRequest()));
		$result = $query->fetchField();
		$entity = $entityStorage->load($result);
		return ($entity) ? Json::decode($entity->get('xjson_definition')->value) : NULL;
	}

	/**
	 * @return mixed
	 */
	protected function getCurrentUserIdCode(){
		return User::load($this->currentUser->id())->field_user_idcode->value;
	}

	/**
	 * @param $response_body
	 * @return array
	 * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
	 * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
	 */
	public function buildFormBody($response_body){
		$definition = $this->getEntityJsonObject()['body'];

		$response_json['header'] = $response_body['header'];
		foreach($response_body['body']['steps'] as $step_index => $step){
			if(isset($step['data_elements'])){
				foreach($step['data_elements'] as $data_element_index => $data_element){
					if(isset($definition['steps'][$step_index]['data_elements'][$data_element_index])){
						$element_from_def = $definition['steps'][$step_index]['data_elements'][$data_element_index];
						if(is_array($data_element)){
							$element_with_def = $step['data_elements'][$data_element_index] + $element_from_def;
						}else{
							$element_with_def = $element_from_def += [
									'value' => $data_element
							];
						}
						$response_body['body']['steps'][$step_index]['data_elements'][$data_element_index] = $element_with_def;
					}else{
						// if something is broken exit immediately
						return $response_body;
					}
				}
			}
			return $response_body;
		}
		return $response_body;
	}

	/**
	 * @param $response
	 * @return array
	 * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
	 * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
	 */
	public function buildFormBodyv2($response){
		#dump($response);
		$response_body = isset($response['body']) ? $response['body'] : NULL;
		$response_header = isset($response['header']) ? $response['header'] : NULL;
		$response_messages = isset($response['messages']) ? $response['messages'] : NULL;
		$definition = $this->getEntityJsonObject()['body'];
		$return = [];

		if($response_header) $return['header'] = $response_header;
		if($response_messages) $return['messages'] = $response_messages;

		if($response_body && !empty($response_body['steps'])){
			foreach($definition['steps'] as $step_key => $step){
				if(isset($response_body['steps'][$step_key])){
					foreach($response_body['steps'][$step_key]['data_elements'] as $element_key => $element){
						if(isset($definition['steps'][$step_key]['data_elements'][$element_key])){
							if($definition['steps'][$step_key]['data_elements'][$element_key]['type'] === 'table'){
								$table_definition_keys = array_keys($definition['steps'][$step_key]['data_elements'][$element_key]['table_columns']);
								foreach($element['value'] as $value){
									foreach($value as $value_key => $item){
										if(!in_array($value_key, $table_definition_keys)) throw new HttpException('400', "steps.$step_key.$element.$value_key missing from definition");
									}
								}
							}
							if(is_array($element)){
								$return['body']['steps'][$step_key]['data_elements'][$element_key] = $definition['steps'][$step_key]['data_elements'][$element_key] + $element;
							}else{
								$return['body']['steps'][$step_key]['data_elements'][$element_key] = $definition['steps'][$step_key]['data_elements'][$element_key]['value'] + $element;
							}
						}else{
							throw new HttpException('400', "$element_key missing from definition");
						}
					}
				}
			}
		}else{
			$return['body'] = $response_body;
		}

		return $return;
	}


}
