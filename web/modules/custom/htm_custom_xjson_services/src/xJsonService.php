<?php

namespace Drupal\htm_custom_xjson_services;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Database\Query\Select;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

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
			$definition_header['endpoint'] = 'EHISUS';
			// set definition header and add server-side idCode
			$baseJson['header'] = $definition_header = [
				'agents' => [
					['person_id' => $this->getCurrentUserIdCode(), 'role' => 'TAOTLEJA']
				]
			] + $baseJson['header'];
		}

		return $baseJson;
	}

	protected function getFormNameFromRequest(){
		return $this->currentRequestContent->form_name;
	}

	protected function getEntityJsonObject(){
		$entityStorage = $this->entityTypeManager->getStorage('x_json_entity');
		$connection = \Drupal::database();
		$query = $connection->query("SELECT id FROM x_json_entity WHERE xjson_definition->'header'->>'form_name' = :id", array(':id' => $this->getFormNameFromRequest()));
		$result = $query->fetchField();
		$entity = $entityStorage->load($result);
		return ($entity) ? Json::decode($entity->get('xjson_definition')->value) : NULL;
	}

	protected function getCurrentUserIdCode(){
		return User::load($this->currentUser->id())->field_user_idcode->value;
	}

	public function buildFormBody($response_body){
		$definition = $this->getEntityJsonObject()['body'];

		$response_json['header'] = $response_body['header'];
		foreach($response_body['body']['steps'] as $step_index => $step){
			if(isset($step['data_elements'])){
				foreach($step['data_elements'] as $data_element_index => $data_element){
					$element_from_def = $definition['steps'][$step_index]['data_elements'][$data_element_index];

					if(is_array($data_element)){
						$element_with_def = $step['data_elements'][$data_element_index] + $element_from_def;
					}else{
						$element_with_def = $element_from_def += [
							'value' => $data_element
						];
					}
					$response_body['body']['steps'][$step_index]['data_elements'][$data_element_index] = $element_with_def;
				}
			}
		}

		return ($response_body);
	}


}
