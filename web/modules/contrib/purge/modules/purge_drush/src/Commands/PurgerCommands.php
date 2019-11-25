<?php

namespace Drupal\purge_drush\Commands;

use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface;
use Drush\Commands\DrushCommands;

/**
 * Configure Purge Purgers from the command line.
 */
class PurgerCommands extends DrushCommands {

  /**
   * The 'purge.purgers' service.
   *
   * @var \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface
   */
  protected $purgePurgers;

  /**
   * Construct a PurgerCommands object.
   *
   * @param \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface $purge_purgers
   *   The purge purgers service.
   */
  public function __construct(PurgersServiceInterface $purge_purgers) {
    parent::__construct();
    $this->purgePurgers = $purge_purgers;
  }

  /**
   * Create a new purger instance.
   *
   * @param string $id
   *   The plugin ID of the purger instance to create.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @option if-not-exists
   *   Don't create a new purger if one of this type exists.
   * @usage drush p:purger-add ID
   *   Add a purger of type ID.
   * @usage drush p:purger-add --if-not-exists ID
   *   Create purger ID if it does not exist.
   *
   * @command p:purger-add
   * @aliases ppadd,p-purger-add
   */
  public function purgerAdd($id, array $options = ['format' => 'string', 'if-not-exists' => FALSE]) {
    $enabled = $this->purgePurgers->getPluginsEnabled();

    // Verify that the plugin exists.
    if (!isset($this->purgePurgers->getPlugins()[$id])) {
      throw new \Exception(dt('The given plugin does not exist!'));
    }

    // When --if-not-exists is passed, we cancel creating double purgers.
    if ($options['if-not-exists']) {
      if (in_array($id, $enabled)) {
        if ($options['format'] == 'string') {
          $this->io()->success(dt('The purger already exists!'));
        }
        return;
      }
    }

    // Verify that new instances of the plugin may be created.
    if (!in_array($id, $this->purgePurgers->getPluginsAvailable())) {
      throw new \Exception(dt('No more instances of this plugin can be created!'));
    }

    // Define the new instance and store it.
    $enabled[$this->purgePurgers->createId()] = $id;
    $this->purgePurgers->setPluginsEnabled($enabled);
    if ($options['format'] == 'string') {
      $this->io()->success(dt('The purger has been created!'));
    }
  }

  /**
   * List all configured purgers in order of execution.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:purger-ls
   *   List all configured purgers in order of execution.
   * @usage drush p:purger-ls --format=list
   *   Retrieve a simple list of instance IDs.
   * @usage drush p:purger-ls --format=json
   *   Export as JSON.
   * @usage drush p:purger-ls --format=yaml
   *   Export as YAML.
   *
   * @command p:purger-ls
   * @aliases ppls,p-purger-ls
   * @field-labels
   *   instance_id: Instance
   *   plugin_id: Plugin
   *   label: Label
   *   description: Description
   *
   * @return \Consolidation\OutputFormatters\StructuredData\RowsOfFields
   *   Row-based structure of data.
   */
  public function purgerList(array $options = ['format' => 'table']) {
    $definitions = $this->purgePurgers->getPlugins();
    $enabled = $this->purgePurgers->getPluginsEnabled();
    $labels = $this->purgePurgers->getLabels();
    $rows = [];

    if ($options['format'] == 'list') {
      foreach ($enabled as $instance_id => $plugin_id) {
        $rows[] = $instance_id;
      }
      return $rows;
    }
    else {
      foreach ($enabled as $instance_id => $plugin_id) {
        $rows[$instance_id] = [
          'instance_id' => $instance_id,
          'plugin_id' => $plugin_id,
          'label' => (string) $labels[$instance_id],
          'description' => (string) $definitions[$plugin_id]['description'],
        ];
      }
      return new RowsOfFields($rows);
    }
  }

  /**
   * List available plugin IDs for which purgers can be added.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:purgers-lsa
   *   List available plugin IDs for which purgers can be created.
   * @usage drush p:purgers-lsa --format=list
   *   Retrieve a simple list of plugin IDs.
   * @usage drush p:purgers-lsa --format=json
   *   Export as JSON.
   * @usage drush p:purgers-lsa --format=yaml
   *   Export as YAML.
   *
   * @command p:purger-lsa
   * @aliases pplsa,p-purger-lsa
   * @field-labels
   *   plugin_id: Plugin
   *   label: Label
   *   description: Description
   *
   * @return \Consolidation\OutputFormatters\StructuredData\RowsOfFields
   *   Row-based structure of data.
   */
  public function purgerListAvailable(array $options = ['format' => 'table']) {
    $definitions = $this->purgePurgers->getPlugins();
    $available = $this->purgePurgers->getPluginsAvailable();
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
   * Move the given purger DOWN in the execution order.
   *
   * @param string $id
   *   The instance ID of the purger to move down.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:purger-mv-down ID
   *   Move this purger down.
   *
   * @command p:purger-mvd
   * @aliases ppmvd,p-purger-mvd
   */
  public function purgerMoveDown($id, array $options = ['format' => 'string']) {
    $enabled = $this->purgePurgers->getPluginsEnabled();

    // Verify that the purger instance exists.
    if (!isset($enabled[$id])) {
      throw new \Exception(dt('The given instance ID is not valid!'));
    }

    // Move the purger down and finish command execution.
    $this->purgePurgers->movePurgerDown($id);
    if ($options['format'] == 'string') {
      $this->io()->success(dt('The purger moved one place down!'));
    }
  }

  /**
   * Move the given purger UP in the execution order.
   *
   * @param string $id
   *   The instance ID of the purger to move up.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:purger-mv-down ID
   *   Move this purger up.
   *
   * @command p:purger-mvu
   * @aliases ppmvu,p-purger-mvu
   */
  public function purgerMoveUp($id, array $options = ['format' => 'string']) {
    $enabled = $this->purgePurgers->getPluginsEnabled();

    // Verify that the purger instance exists.
    if (!isset($enabled[$id])) {
      throw new \Exception(dt('The given instance ID is not valid!'));
    }

    // Move the purger up and finish command execution.
    $this->purgePurgers->movePurgerUp($id);
    if ($options['format'] == 'string') {
      $this->io()->success(dt('The purger moved one place up!'));
    }
  }

  /**
   * Remove a purger instance.
   *
   * @param string $id
   *   The instance ID of the purger to remove.
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:purger-rm ID
   *   Remove the given purger.
   *
   * @command p:purger-rm
   * @aliases pprm,p-purger-rm
   */
  public function purgerRemove($id, array $options = ['format' => 'string']) {
    $enabled = $this->purgePurgers->getPluginsEnabled();

    // Verify that the purger instance exists.
    if (!isset($enabled[$id])) {
      throw new \Exception(dt('The given instance ID is not valid!'));
    }

    // Remove the purger instance and finish command execution.
    unset($enabled[$id]);
    $this->purgePurgers->setPluginsEnabled($enabled);
    if ($options['format'] == 'string') {
      $this->io()->success(dt('The purger has been removed!'));
    }
  }

}
