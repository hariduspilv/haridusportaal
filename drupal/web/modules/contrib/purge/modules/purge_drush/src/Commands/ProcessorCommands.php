<?php

namespace Drupal\purge_drush\Commands;

use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface;
use Drush\Commands\DrushCommands;

/**
 * Configure Purge processors from the command line.
 */
class ProcessorCommands extends DrushCommands {

  /**
   * The 'purge.processors' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface
   */
  protected $purgeProcessors;

  /**
   * Construct a ProcessorCommands object.
   *
   * @param \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface $purge_processors
   *   The purge processors service.
   */
  public function __construct(ProcessorsServiceInterface $purge_processors) {
    parent::__construct();
    $this->purgeProcessors = $purge_processors;
  }

  /**
   * Add a new processor.
   *
   * @param string $id
   *   The plugin ID of the processor to add.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:processor-add ID
   *   Add a processor of type ID.
   *
   * @command p:processor-add
   * @aliases pradd,p-processor-add
   */
  public function processorAdd($id, array $options = ['format' => 'string']) {
    $enabled = $this->purgeProcessors->getPluginsEnabled();

    // Verify that the plugin exists.
    if (!isset($this->purgeProcessors->getPlugins()[$id])) {
      throw new \Exception(dt('The given plugin does not exist!'));
    }

    // Verify that the plugin is available and thus not yet enabled.
    if (!in_array($id, $this->purgeProcessors->getPluginsAvailable())) {
      if ($options['format'] == 'string') {
        $this->io()->success(dt('The processor is already enabled!'));
      }
      return;
    }

    // Define the new instance and store it.
    $enabled[] = $id;
    $this->purgeProcessors->setPluginsEnabled($enabled);
    if ($options['format'] == 'string') {
      $this->io()->success(dt('The processor has been added!'));
    }
  }

  /**
   * List all enabled processors.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:processor-ls
   *   List all processors in a table.
   * @usage drush p:processor-ls --format=list
   *   Retrieve a simple list of plugin IDs.
   * @usage drush p:processor-ls --table=json
   *   Export all processors in JSON.
   * @usage drush p:processor-ls --table=yaml
   *   Export all processors in YAML.
   *
   * @command p:processor-ls
   * @aliases prls,p-processor-ls
   * @field-labels
   *   id: Id
   *   label: Label
   *   description: Description
   *
   * @return \Consolidation\OutputFormatters\StructuredData\RowsOfFields
   *   Row-based structure of data.
   */
  public function processorList(array $options = ['format' => 'table']) {
    $rows = [];
    if ($options['format'] == 'list') {
      foreach ($this->purgeProcessors as $processor) {
        $rows[] = $processor->getPluginId();
      }
      return $rows;
    }
    else {
      foreach ($this->purgeProcessors as $processor) {
        $rows[] = [
          'id' => (string) $processor->getPluginId(),
          'label' => (string) $processor->getLabel(),
          'description' => (string) $processor->getDescription(),
        ];
      }
      return new RowsOfFields($rows);
    }
  }

  /**
   * List available processor plugin IDs that can be added.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:processor-lsa
   *   List available plugin IDs for which processors can be created.
   * @usage drush p:processor-lsa --format=list
   *   Retrieve a simple list of plugin IDs.
   * @usage drush p:processor-lsa --format=json
   *   Export as JSON.
   * @usage drush p:processor-lsa --format=yaml
   *   Export as YAML.
   *
   * @command p:processor-lsa
   * @aliases prlsa,p-processor-lsa
   * @field-labels
   *   plugin_id: Plugin
   *   label: Label
   *   description: Description
   *
   * @return \Consolidation\OutputFormatters\StructuredData\RowsOfFields
   *   Row-based structure of data.
   */
  public function processorListAvailable(array $options = ['format' => 'table']) {
    $definitions = $this->purgeProcessors->getPlugins();
    $available = $this->purgeProcessors->getPluginsAvailable();
    $rows = [];

    if ($options['format'] == 'list') {
      foreach ($available as $plugin_id) {
        $rows[] = $plugin_id;
      }
      return $rows;
    }
    else {
      foreach ($available as $plugin_id) {
        $rows[$plugin_id] = [
          'plugin_id' => $plugin_id,
          'label' => (string) $definitions[$plugin_id]['label'],
          'description' => (string) $definitions[$plugin_id]['description'],
        ];
      }
      return new RowsOfFields($rows);
    }
  }

  /**
   * Remove a processor.
   *
   * @param string $id
   *   The plugin ID of the processor to remove.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:processor-rm ID
   *   Remove the given processor.
   *
   * @command p:processor-rm
   * @aliases prrm,p-processor-rm
   */
  public function processorRemove($id, array $options = ['format' => 'string']) {
    $enabled = $this->purgeProcessors->getPluginsEnabled();

    // Verify that the processor exists.
    if (!in_array($id, $enabled)) {
      throw new \Exception(dt('The given plugin ID is not valid!'));
    }

    // Remove the processor and finish command execution.
    unset($enabled[array_search($id, $enabled)]);
    $this->purgeProcessors->setPluginsEnabled($enabled);
    if ($options['format'] == 'string') {
      $this->io()->success(dt('The processor has been removed!'));
    }
  }

}
