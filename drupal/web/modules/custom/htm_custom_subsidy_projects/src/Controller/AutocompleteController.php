<?php

namespace Drupal\htm_custom_subsidy_projects\Controller;

use Drupal\Component\Utility\Tags;
use Drupal\Component\Utility\Unicode;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class AutocompleteController extends ControllerBase {

	public function handleAutocomplete(Request $request){
		$results = [];
		if($input = $request->get('q')){
			$typed_string = Tags::explode($input);
			$typed_string = Unicode::strtolower(array_pop($typed_string));

			#$query = \Drupal::entityQuery('node');
			#$query->ad
			#$query->condition('type', 'school');
			$query = \Drupal::database()->select('node', 'n');
			$query->addField('nfd', 'title', 'label');
			$query->addField('fei', 'field_ehis_id_value', 'id');
			$query->join('node__field_ehis_id', 'fei', 'fei.entity_id = n.nid');
			$query->join('node_field_data', 'nfd', 'nfd.nid = n.nid');
			$query->condition('nfd.type', 'school');
			$query->condition('fei.field_ehis_id_value', $query->escapeLike($typed_string) . '%', 'LIKE');


			$results = $query->execute()->fetchAll();
		}

		return new JsonResponse($results);
	}
}