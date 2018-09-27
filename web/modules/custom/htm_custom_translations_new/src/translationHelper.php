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
			$elem = [
				'translation_type' => (preg_match("/<[^<]+>/",$v,$m)) ? 'text_format' : 'textarea',
				'et' => $v,
				'en' => '',
			];
			return $elem;
		}, $result);
		return $result;
	}

}