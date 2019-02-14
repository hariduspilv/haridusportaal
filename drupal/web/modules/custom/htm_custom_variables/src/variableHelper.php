<?php

namespace Drupal\htm_custom_variables;

class variableHelper{
	public function parseDot($key){
		return str_replace('.' , '-', $key);
	}

	public function parseSlash($key){
		return str_replace('-', '.', $key);
	}

	public function flatten($array, $prefix = '') {
		$result = array();
		foreach($array as $key=>$value) {
			if(is_array($value) && !isset($value['variable_type'])) {
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
		foreach ($array as $key => $value) {
			if (is_array($value) && (!isset($value['et']) && !isset($value['en'])))
				$result = array_merge($result, $this->flattenImportJson($value, $prefix . $key . '.'));
			else
				$result[$prefix . $key] = $value;
		}

		return $result;
	}

}