<?php

namespace Drupal\purge_drush\Commands;

use Consolidation\AnnotatedCommand\AnnotationData;
use Consolidation\OutputFormatters\Options\FormatterOptions;
use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface;
use Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface;
use Drush\Commands\DrushCommands;
use Symfony\Component\Console\Input\InputInterface;

/**
 * List all supported cache invalidation types.
 */
class TypesCommand extends DrushCommands {

  /**
   * The 'purge.purgers' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface
   */
  protected $purgePurgers;

  /**
   * The 'purge.invalidation.factory' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface
   */
  protected $purgeInvalidationFactory;

  /**
   * Construct a TypesCommand object.
   *
   * @param \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface $purge_invalidation_factory
   *   The purge invalidation factory service.
   * @param \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface $purge_purgers
   *   The purge purgers service.
   */
  public function __construct(InvalidationsServiceInterface $purge_invalidation_factory, PurgersServiceInterface $purge_purgers) {
    parent::__construct();
    $this->purgeInvalidationFactory = $purge_invalidation_factory;
    $this->purgePurgers = $purge_purgers;
  }

  /**
   * Dynamically add field labels for the purger columns.
   *
   * @hook init p:types
   */
  public function addFieldLabels(InputInterface $input, AnnotationData $annotationData) {
    if (isset($annotationData['field-labels'])) {
      foreach ($this->purgePurgers->getLabels() as $id => $label) {
        $annotationData['field-labels'] .= sprintf("\n%s: %s", $id, $label);
      }
    }
  }

  /**
   * List all supported cache invalidation types.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:types
   *   List all supported cache invalidation types.
   * @usage drush p:types --format=list
   *   Renders a simple list of supported invalidation types.
   * @usage drush p:types --format=json
   *   Export as JSON.
   * @usage drush p:types --format=yaml
   *   Export as YAML.
   *
   * @command p:types
   * @aliases ptyp,p-types
   * @field-labels
   *   type: Type
   *   supported: Supported
   *
   * @return \Consolidation\OutputFormatters\StructuredData\RowsOfFields
   *   Row-based structure of data.
   */
  public function types(array $options = ['format' => 'table']) {
    $types_by_purger = $this->purgePurgers->getTypesByPurger();
    $types = $this->purgePurgers->getTypes();
    $rows = [];

    // Return a simple listing of supported types.
    if (in_array($options['format'], ['list', 'string'])) {
      foreach ($types as $type) {
        $rows[] = $type;
      }
      return ($options['format'] == 'string') ? implode(',', $rows) : $rows;
    }

    // Return a complexer data structure that tells which purger supports what.
    foreach ($this->purgeInvalidationFactory->getPlugins() as $type => $typedef) {
      $rows[$type] = [
        'type' => [
          'id' => $typedef['id'],
          'label' => (string) $typedef['label'],
        ],
        'supported' => in_array($type, $types),
      ];
      foreach ($this->purgePurgers->getPluginsEnabled() as $id => $plugin_id) {
        $rows[$type][$id] = in_array($type, $types_by_purger[$id]);
      }
    }

    // Structurize the data and pass a render function for pretty table output.
    $rows = new RowsOfFields($rows);
    $rows->addRendererFunction(
      function ($key, $cellData, FormatterOptions $options, $rowData) {
        if ($key == 'type') {
          return $cellData['label'];
        }
        elseif (is_bool($cellData)) {
          return $cellData ? '[X]' : '';
        }
        return $cellData;
      }
    );

    return $rows;
  }

}
