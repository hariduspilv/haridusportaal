<?php

namespace Drupal\htm_custom_subsidy_projects\Plugin\GraphQL\Derivers;

use Drupal\Component\Plugin\Derivative\DeriverBase;

/**
* Provides GraphQL Field plugin definitions for Subsidy project fields.
*/
class SubsidyMapDeriver extends DeriverBase {

  /**
  * List of derivative definitions.
  *
  * @var array
  */
  protected $derivatives = [];

  /**
  * {@inheritdoc}
  */
  public function getDerivativeDefinitions($base_plugin_definition) {

    $fields = array(
      'nid' => 'Int',
      'lat' => 'String',
      'lon' => 'String',
      'investmentLocation' => 'String',
      'investmentAmountSum' => 'Int',
			'schoolInfo' => 'Entity'
    );

    foreach($fields as $field => $type){
      $this->derivatives[$field] = $base_plugin_definition;
      $this->derivatives[$field]['name'] = $field;
      $this->derivatives[$field]['type'] = $type;
    }

    return $this->derivatives;
  }

}
