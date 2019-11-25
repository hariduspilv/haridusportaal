<?php

namespace Drupal\purge_drush\Commands;

use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface;
use Drush\Commands\DrushCommands;

/**
 * Configure Purge queuers from the command line.
 */
class QueuerCommands extends DrushCommands {

  /**
   * The 'purge.queuers' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface
   */
  protected $purgeQueuers;

  /**
   * Construct a QueuerCommands object.
   *
   * @param \Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface $purge_queuers
   *   The purge queuers service.
   */
  public function __construct(QueuersServiceInterface $purge_queuers) {
    parent::__construct();
    $this->purgeQueuers = $purge_queuers;
  }

  /**
   * Add a new queuer.
   *
   * @param string $id
   *   The plugin ID of the queuer to add.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:queuer-add ID
   *   Add a queuer of type ID.
   *
   * @command p:queuer-add
   * @aliases puadd,p-queuer-add
   */
  public function queuerAdd($id, array $options = ['format' => 'string']) {
    $enabled = $this->purgeQueuers->getPluginsEnabled();

    // Verify that the plugin exists.
    if (!isset($this->purgeQueuers->getPlugins()[$id])) {
      throw new \Exception(dt('The given plugin does not exist!'));
    }

    // Verify that the plugin is available and thus not yet enabled.
    if (!in_array($id, $this->purgeQueuers->getPluginsAvailable())) {
      if ($options['format'] == 'string') {
        $this->io()->success(dt('The queuer is already enabled!'));
      }
      return;
    }

    // Define the new instance and store it.
    $enabled[] = $id;
    $this->purgeQueuers->setPluginsEnabled($enabled);
    if ($options['format'] == 'string') {
      $this->io()->success(dt('The queuer has been added!'));
    }
  }

  /**
   * List all enabled queuers.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:queuer-ls
   *   List all queuers in a table.
   * @usage drush p:queuer-ls --format=list
   *   Retrieve a simple list of plugin IDs.
   * @usage drush p:queuer-ls --table=json
   *   Export all queuers in JSON.
   * @usage drush p:queuer-ls --table=yaml
   *   Export all queuers in YAML.
   *
   * @command p:queuer-ls
   * @aliases puls,p-queuer-ls
   * @field-labels
   *   id: Id
   *   label: Label
   *   description: Description
   *
   * @return \Consolidation\OutputFormatters\StructuredData\RowsOfFields
   *   Row-based structure of data.
   */
  public function queuerList(array $options = ['format' => 'table']) {
    $rows = [];
    if ($options['format'] == 'list') {
      foreach ($this->purgeQueuers as $queuer) {
        $rows[] = $queuer->getPluginId();
      }
      return $rows;
    }
    else {
      foreach ($this->purgeQueuers as $queuer) {
        $rows[] = [
          'id' => (string) $queuer->getPluginId(),
          'label' => (string) $queuer->getLabel(),
          'description' => (string) $queuer->getDescription(),
        ];
      }
      return new RowsOfFields($rows);
    }
  }

  /**
   * List available queuer plugin IDs that can be added.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:queuer-lsa
   *   List available plugin IDs for which queuers can be created.
   * @usage drush p:queuer-lsa --format=list
   *   Retrieve a simple list of plugin IDs.
   * @usage drush p:queuer-lsa --format=json
   *   Export as JSON.
   * @usage drush p:queuer-lsa --format=yaml
   *   Export as YAML.
   *
   * @command p:queuer-lsa
   * @aliases pulsa,p-queuer-lsa
   * @field-labels
   *   plugin_id: Plugin
   *   label: Label
   *   description: Description
   *
   * @return \Consolidation\OutputFormatters\StructuredData\RowsOfFields
   *   Row-based structure of data.
   */
  public function queuerListAvailable(array $options = ['format' => 'table']) {
    $definitions = $this->purgeQueuers->getPlugins();
    $available = $this->purgeQueuers->getPluginsAvailable();
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
   * Remove a queuer.
   *
   * @param string $id
   *   The plugin ID of the queuer to remove.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:queuer-rm ID
   *   Remove the given queuer.
   *
   * @command p:queuer-rm
   * @aliases purm,p-queuer-rm
   */
  public function queuerRemove($id, array $options = ['format' => 'string']) {
    $enabled = $this->purgeQueuers->getPluginsEnabled();

    // Verify that the queuer exists.
    if (!in_array($id, $enabled)) {
      throw new \Exception(dt('The given plugin ID is not valid!'));
    }

    // Remove the queuer and finish command execution.
    unset($enabled[array_search($id, $enabled)]);
    $this->purgeQueuers->setPluginsEnabled($enabled);
    if ($options['format'] == 'string') {
      $this->io()->success(dt('The queuer has been removed!'));
    }
  }

}
