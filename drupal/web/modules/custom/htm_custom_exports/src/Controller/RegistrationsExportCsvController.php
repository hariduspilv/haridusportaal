<?php

namespace Drupal\htm_custom_exports\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\Session\AccountInterface;
use Drupal\node\NodeInterface;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use League\Csv\Writer;

/**
 * Class UserAuthAccessCheck.
 */
class RegistrationsExportCsvController extends ControllerBase {

	/**
	 * A custom access check.
	 *
	 * @param \Drupal\Core\Session\AccountInterface $account
	 *   Run access checks for this account.
	 */
  public function access(AccountInterface $account, NodeInterface $event_node_id){
  	$user = User::load($this->currentUser()->id());

		if($account->isAuthenticated() && ($user->field_user_idcode->value === $event_node_id->field_organizer_idcode->value) && $event_node_id->bundle() === 'event' ){
			return AccessResult::allowed();
		}
		return AccessResult::forbidden();
	}

	public function exportcsv(Request $request, NodeInterface $event_node_id){

		$query = \Drupal::entityQuery('event_reg_entity');
		$query->accessCheck(TRUE);
		$query->condition('status', 1);
		$query->condition('event_reference', $event_node_id->id(), '=');

		$enids = $query->execute();

		$entities = \Drupal::entityTypeManager()->getStorage('event_reg_entity')->loadMultiple($enids);

		//dump($entities);

		if(!empty($entities)){
			$export = $this->export_csv($entities);

			$response = new Response();
			$response->setContent($export);
			return $response;
		}


		return new Response('error', 400);
	}

	private function export_csv($entities){
		$csv = Writer::createFromFileObject(new \SplTempFileObject());
		$csv->setDelimiter(';');

		$csv->insertOne([
			$this->t('idcode'),
			$this->t('Participant First name'),
			$this->t('Participant Last name'),
			$this->t('Participant organization'),
			$this->t('Participant email'),
			$this->t('Participant telephone'),
			$this->t('Comment'),
			$this->t('Registration date')
		]);

  	foreach($entities as $entity){
  		$csv->insertOne([
				($idcode = $entity->participant_idcode->value) ? $idcode : null ,
				$entity->participant_first_name->value,
				$entity->participant_last_name->value,
				$entity->participant_organization->value,
				$entity->participant_email->value,
				$entity->participant_phone->value,
				$entity->participant_comment->value,
				date('d-m-Y H:i',$entity->created->value),
			]);
		}
		#dump($csv->output());

		$csv->output('registrations.csv');
	}

}
