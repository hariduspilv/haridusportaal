<?php

namespace Drupal\htm_custom_subsidy_projects;

class ProcessSubsidy {

	public static function ValidateFile($items, &$context){
		$message = t('Validating file');

		$results = [];

		foreach ($items as $index => $item){
			$results[] = $index . ' - validation';
			if($index === 4) $context['results']['error'] = t('Line: '. $index . ' Error found!');
		}
		$context['message'] = $message;
		$context['results']['values'] = $results;
	}

	public static function ProcessSubsidy($items, &$context){
		// do nothing if error's
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
				$message = [$results['error'], 'error'];
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
}