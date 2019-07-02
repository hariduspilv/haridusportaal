<?php

namespace Drupal\module_missing_message_fixer\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\module_missing_message_fixer\ModuleMissingMessageFixer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Messenger\MessengerInterface;

/**
 * Class ModuleMissingMessageFixerForm.
 *
 * @package Drupal\module_missing_message_fixer
 */
class ModuleMissingMessageFixerForm extends FormBase {

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The Messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * The Module Missing Message Fixer service.
   *
   * @var \Drupal\module_missing_message_fixer\ModuleMissingMessageFixer
   */
  protected $mmmf;

  /**
   * Constructs a new ModuleMissingMessageFixerForm.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The messenger service.
   * @param \Drupal\module_missing_message_fixer\ModuleMissingMessageFixer $mmmf
   *   The mmmf service.
   */
  public function __construct(Connection $connection, ConfigFactoryInterface $config_factory, MessengerInterface $messenger, ModuleMissingMessageFixer $mmmf) {
    $this->connection = $connection;
    $this->configFactory = $config_factory;
    $this->messenger = $messenger;
    $this->mmmf = $mmmf;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('config.factory'),
      $container->get('messenger'),
      $container->get('module_missing_message_fixer.fixer')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'module_missing_message_fixer_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    // Fancy title string.
    $title = $this->t('This list comes from the system table and is checked against the drupal_get_filename() function. See <a href="@link" target="_blank">this issue</a> for more information.', [
      '@link' => 'https://www.drupal.org/node/2487215',
    ]);

    // Title.
    $form['title'] = [
      '#type' => 'item',
      '#markup' => '<h4>' . $title . '</h4>',
    ];

    // Fancy submit buttons to win this.
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Remove These Errors!'),
    ];

    // Set the tables select to make this more granular.
    $form['table'] = [
      '#type' => 'tableselect',
      '#header' => $this->mmmf->getTableHeader(),
      '#options' => $this->mmmf->getTableRows(),
      '#empty' => $this->t('No Missing Modules Found!!!'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $modules = [];
    // Go through each record and add it to the array to win.
    foreach ($form_state->getValue(['table']) as $module) {
      if ($module) {
        $modules[] = $module;

        // Clean up old migrate configuration.
        $like = $this->connection->escapeLike($module . '.');
        $config_names = $this->connection->select('config', 'c')
          ->fields('c', ['name'])
          ->condition('name', $like . '%', 'LIKE')
          ->execute()
          ->fetchAll();

        // Delete each config using configFactory.
        foreach ($config_names as $config_name) {
          $this->configFactory->getEditable($config_name->name)->delete();
        }

        // Reminds users to export config.
        if (!empty($config_name)) {
          $this->messenger->addWarning("Don't forget to export your config");
        }
      }
    }

    // Delete if there is no modules.
    if (count($modules) > 0) {
      $query = $this->connection->delete('key_value');
      $query->condition('collection', 'system.schema');
      $query->condition('name', $modules, 'IN');
      $query->execute();
    }
  }

}
