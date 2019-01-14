<?php

namespace Drupal\htm_custom_subsidy_projects;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntity;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ProcessSubsidy
 * @package Drupal\htm_custom_subsidy_projects
 */
class ProcessSubsidy {

		public static $k = [
			'EHIS_ID'  => 'There was a timeout before the user could sign with Mobile ID.',
			'MEEDE' => 'tekst',
			'SUMMA' => 'Summa field must be numeric',
			'TAHTAEG' => 'Tahtaeg field format wrong'
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

		#dump(self::$k['EHIS_ID']);
		$results = [];
		$object = [
			'ehis_id' => false,
			'meede' => false,
			'projekt' => false,
			'summa' => false,
			'tahtaeg' => false,
			'ehitise_id' => false,
			'school_ref' => false,
		];
		foreach ($items as $index => $item){
			$object['ehis_id'] = (self::loadEntity('node', 'field_ehis_id', $item['ehis_id']) ? $item['ehis_id'] : FALSE);
			$object['meede'] = self::loadEntity('taxonomy_term', 'name', $item['meede']);
			$object['projekt'] = ($item['projekt']) ? $item['projekt'] : FALSE;
			$object['summa'] = (is_numeric(preg_replace('/\s+/', '', $item['summa'])) ? preg_replace('/\s+/', '', $item['summa']) : FALSE);
			$object['tahtaeg'] = self::checkDateFormat($item['tahtaeg'], 'd.m.Y');
			$object['ehitise_id'] = (strlen($item['ehitise_id']) <= 20) ? $item['ehitise_id'] : FALSE;
			$object['school_ref'] = self::loadEntity('node', 'field_ehis_id', $item['ehis_id']);
			if(
					!$object['ehis_id']
					||
					!$object['meede']
					||
					!$object['projekt']
					||
					!$object['summa']
					||
					!$object['tahtaeg']
					||
					!$object['ehitise_id']){

				$error_messag_func = function($values) {
					foreach($values as $key => $value){
						if($value == false){
							return $key;
						}
					}
				};

				$context['results']['error'][] = t('Error on line: '. ($index + 2) . ' | column: ' . $error_messag_func($object));
			}else{
				$results[] = [
					'ehis_id' => $object['ehis_id'],
					'investment_measure' => $object['meede'],
					'investment_project' => $object['projekt'],
					'investment_amount' => $object['summa'],
					'investment_deadline' => $object['tahtaeg'],
					'building_id' => $object['ehitise_id'],
					'school_ref' => $object['school_ref']
				];
			}
		}

		$context['message'] = $message;
		$context['results']['values'] = $results;
	}

	public static function ProcessSubsidy($items, &$context){
		//process only if no errors otherwise nothing
		if(empty($context['results']['error'])){
			if(empty($context['sandbox'])){
				$context['sandbox']['progress'] = 0;
				$context['sandbox']['current_id'] = 0;
				$context['sandbox']['max'] = count($context['results']['values']);
			}


			if($context['sandbox']['current_id'] <= $context['sandbox']['max']){
				$limit = $context['sandbox']['current_id'] + 10;
				if ($context['sandbox']['max'] - $context['sandbox']['current_id'] < 10){
					$limit = $context['sandbox']['max'] + 1;
				}
				for($i = $context['sandbox']['current_id']; $i < $limit; $i++){
					// do something
					$values = $context['results']['values'][$i];
					if($values){
						$entity = SubsidyProjectEntity::create($values);
					}

					$entity->save();
					$context['sandbox']['progress']++;
					$context['sandbox']['current_id'] = $i;
					#$context['message'] = t('Processing lines : @limit - @current ', ['@limit' => $limit, '@current' => $context['sandbox']['current_id'] + 1]);
					$context['message'] = $context['sandbox']['max'];

					$context['results']['processed'][] = $entity->id();
				}
				$context['sandbox']['current_id']++;

				if ($context['sandbox']['progress'] != $context['sandbox']['max']) {
					$context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
				}
			}else{
				$context['finished'] = 1;
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
					'One subsidy processed.', '@count subsidies processed.'
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
			return $d->format('Y-m-d');
		}catch (\Exception $e){
			return false;
		}
	}
}