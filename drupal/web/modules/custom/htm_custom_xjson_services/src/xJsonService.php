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
		return $this->getEntityJsonObject()['header'];
	}

	public function getxJsonBody(){
		return $this->getEntityJsonObject()['body'];
	}

	public function getxJsonMessages(){
		return $this->getEntityJsonObject()['messages'];
	}

	public function getBasexJsonForm($first = FALSE){
		if($first){
			$json = $this->getxJsonHeader();
			$baseJson['header'] = $json +[
				'current_step' => null,
				'identifier' => null,
				'agents' => [
					['person_id' => $this->getCurrentUserIdCode(), 'role' => 'TAOTLEJA']
				]
			];
			$baseJson['body'] = [
				'steps' => [],
				'messages' => []
			];
			$baseJson['messages'] = [];

			return $baseJson;
		}

		return [];
	}

	protected function getFormNameFromRequest(){
		return $this->currentRequestContent->form_name;
	}

	protected function getEntityJsonObject(){
		$entityStorage = $this->entityTypeManager->getStorage('x_json_entity');
		$connection = \Drupal::database();
		$query = $connection->query("SELECT id FROM x_json_entity WHERE metatage->'header'->>'form_name' = :id", array(':id' => $this->getFormNameFromRequest()));
		$result = $query->fetchField();
		$entity = $entityStorage->load($result);
		return ($entity) ? Json::decode($entity->get('metatage')->value) : NULL;
	}

	protected function getCurrentUserIdCode(){
		return User::load($this->currentUser->id())->field_user_idcode->value;
	}


}
