<?php

namespace Drupal\htm_custom_subsidy_projects;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntity;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ProcessSubsidy
 * @package Drupal\htm_custom_subsidy_projects
 */
class ProcessSubsidy {

	public $get_error_messages = [
		'ehis_id'  => 'There was a timeout before the user could sign with Mobile ID.',
		'USER_CANCEL'          => 'User has cancelled the signing operation.',
		'NOT_VALID'            => 'Signature is not valid.',
		'MID_NOT_READY'        => 'Mobile ID is not yet available for this phone. Please try again later.',
	];
	/**
	 * {@inheritdoc}
	 */
	public static function create(ContainerInterface $container) {
		return new static();
	}


	public static function ValidateFile($items, &$context){
		$message = t('Validating file');

		//first delete all subsidies
		self::deleteAllEntities();

		$results = [];
		foreach ($items as $index => $item){
			$ehis_id = self::loadEntity('node', 'field_ehis_id', $item['ehis id']);
			$meede = self::loadEntity('taxonomy_term', 'name', $item['meede']);
			$summa = (is_numeric(preg_replace('/\s+/', '', $item['summa'])) ? $item['summa'] : FALSE);
			$tahtaeg = (self::checkDateFormat($item['tahtaeg'], 'd.m.Y') ? $item['tahtaeg'] : FALSE);

			if(
					!$meede
					||
					!$ehis_id
					||
					!$summa
					||
					!$tahtaeg){
				$context['results']['error'][] = t('Error on line: '. ($index + 2));
			}else{
				$results[] = [
					'ehis_id' => $ehis_id,
					'ivestment_measure' => $meede,
					'investment_amount' => $summa,
					'investment_deadline' => $tahtaeg,
				];
			}
		}

		$context['message'] = $message;
		$context['results']['values'] = $results;
	}

	public static function ProcessSubsidy($items, &$context){
		// do nothing if error's
		#dump($context);
		#dump($items);
		#die();
		#dump(count($context['results']['values']));
		//process only if no errors otherwise nothing
		if(empty($context['results']['error'])){
			if(empty($context['sandbox'])){
				$context['sandbox']['progress'] = 0;
				$context['sandbox']['current_id'] = 0;
				#$context['sandbox']['max'] = count($context['results']['values']);
				$context['sandbox']['max'] = 200;
			}
			$limit = 10;
			for($i = $context['sandbox']['current_id']; $i <= $limit; $i++){
				// do something
				$context['sandbox']['progress']++;
				$context['message'] = $i;
			}

			if($context['sandbox']['progress'] != $context['sandbox']['max']){
				$context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
			}
		}
	}

	public static function ProcessSubsidyFinishedCallback($success, $results, $operations){
		// The 'success' parameter means no fatal PHP errors were detected. All
		// other error management should be handled using 'results'.
		#dump($results['values']);
		#die();
		if ($success) {
			if(isset($results['error'])){
				$message = [implode(', ', $results['error']), 'error'];
			}else{
				$message = [\Drupal::translation()->formatPlural(
					count($results['processed']),
					'One post processed.', '@count posts processed.'
				), 'status'];
			}
		}
		else {
			$message = [t('Finished with an error.'), 'error'];
		}
		drupal_set_message($message[0], $message[1]);
	}

	public function loadEntity($entity_type, $field, $id){
		$properties = [];

		$storage = \Drupal::service('entity_type.manager')->getStorage($entity_type);
		if($entity_type === 'taxonomy_term'){
			$properties = [
					'vid' => 'investmentmeasure',
					$field => $id
			];
		}else{
			$properties = [$field => $id];
		}
		$entity = reset($storage->loadByProperties($properties));
		#dump($entity);
		return ($entity) ? $entity->id() : FALSE;
	}

	private function deleteAllEntities(){
		$ids = \Drupal::entityQuery('subsidy_project_entity')->execute();
		$storage_handler = \Drupal::entityTypeManager()->getStorage('subsidy_project_entity');
		$entities = $storage_handler->loadMultiple($ids);
		$storage_handler->delete($entities);
	}

	private function checkDateFormat($date_string, $format){
		try{
			$d = DrupalDateTime::createFromFormat($format, $date_string);
			return $d && $d->format($format) === $date_string;
		}catch (\Exception $e){
			return false;
		}
	}
}