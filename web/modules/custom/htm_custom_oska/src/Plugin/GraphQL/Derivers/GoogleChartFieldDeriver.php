<?php

namespace Drupal\htm_custom_oska\Plugin\GraphQL\Derivers;

use Drupal\Component\Plugin\Derivative\DeriverBase;
use Elasticsearch\ClientBuilder;
use Drupal\graphql\Utility\StringHelper;
/**
 * Provides GraphQL Field plugin definitions for Google Chart fields.
 */
class GoogleChartFieldDeriver extends DeriverBase {

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

        $this->derivatives['ChartValue'] = $base_plugin_definition;
        $this->derivatives['ChartValue']['name'] = "ChartValue";
        $this->derivatives['ChartValue']['type'] = 'String';

        return $this->derivatives;
    }
}
