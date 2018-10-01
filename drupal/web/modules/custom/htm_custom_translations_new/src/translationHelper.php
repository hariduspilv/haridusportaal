<?php

namespace Drupal\htm_custom_translations_new;

class translationHelper{
	public function parseDot($key){
		return str_replace('.' , '-', $key);
	}

	public function parseSlash($key){
		return str_replace('-', '.', $key);
	}

	public function flatten($array, $prefix = '') {
		$result = array();
		foreach($array as $key=>$value) {
			if(is_array($value) && !isset($value['translation_type'])) {
				$result = $result + $this->flatten($value, $prefix . $key . '.');
			}
			else {
				$result[$prefix . $key] = $value;
			}
		}
		return $result;
	}

	public function flattenImportJson($array, $prefix = ''){
		$result = array();
		foreach($array as $key=> $value) {
			if(is_array($value)) {
				$result = $result + $this->flatten($value, $prefix . $key . '.');
			}
			else {
				$result[$prefix . $key] = $value;
			}
		}
		$result = array_map(function($v){
			if((preg_match("/<[^<]+>/",$v,$m))){
				$elem = [
					'translation_type' => 'text_format',
					#'et' => ['format' => 'text_format', 'value' => $v],
					'en' => ['format' => 'text_format', 'value' => $v],
				];
			}else{
				$elem = [
					'translation_type' => 'textarea',
					#'et' => $v,
					'en' => $v,
				];
			}

			return $elem;
		}, $result);
		return $result;
	}

}