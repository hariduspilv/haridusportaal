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
		'EXPIRED_TRANSACTION'  => 'There was a timeout before the user could sign with Mobile ID.',
		'USER_CANCEL'          => 'User has cancelled the signing operation.',
		'NOT_VALID'            => 'Signature is not valid.',
		'MID_NOT_READY'        => 'Mobile ID is not yet available for this phone. Please try again later.',
	];

	public static function ValidateFile($items, &$context){
		$message = t('Validating file');

		//first delete all subsidies
		self::deleteAllEntities();

		$results = [];

		foreach ($items as $index => $item){
			if(
					!self::loadEntity('node', 'field_ehis_id', $item['ehis id'])
					||
					!self::loadEntity('taxonomy_term', 'name', $item['meede'])
					||
					!is_numeric(preg_replace('/\s+/', '', $item['summa']))
					||
					!self::checkDateFormat($item['tahtaeg'], 'd.m.Y')
			){
				#dump($index);
				$context['results']['error'][] = t('Error on line: '. ($index + 2));
			}
		}

		$context['message'] = $message;
		$context['results']['values'] = $results;
	}

	public static function ProcessSubsidy($items, &$context){
		// do nothing if error's
		$entity = SubsidyProjectEntity::create([
			'name' => 'testi projekt 3',
			'ehis_id' => 1414,
			/*'investment_measure' => 0,*/
			'investment_amount' => 99,
			'investment_deadline' => '2018-05-18'
		]);
		#$entity->save();
		if(empty($context['results']['error'])){
			foreach($items as $key => $value){
				// create entity;
				$results[] = $key . ' - processed';
			}
			$context['results']['processed'] = $results;
		}
	}

	public static function ProcessSubsidyFinishedCallback($success, $results, $operations){
		// The 'success' parameter means no fatal PHP errors were detected. All
		// other error management should be handled using 'results'.

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
		return ($storage->loadByProperties($properties)) ? TRUE : FALSE;
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