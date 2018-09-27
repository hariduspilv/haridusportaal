<?php

namespace Drupal\htm_custom_translations_new;

class formatKey
{
	public function parseDot($key){
		return str_replace('.' , '-', $key);
	}
	public function parseSlash($key){
		return str_replace('-', '.', $key);
	}

}