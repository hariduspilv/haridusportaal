<?php

namespace Drupal\content_sync\Form;

use Drupal\content_sync\Importer\ContentImporterInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Serialization\Yaml;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a form for importing a single content file.
 */
class ContentSingleImportForm extends FormBase {

  /**
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * @var \Drupal\content_sync\Importer\ContentImporterInterface
   */
  protected $contentImporter;

  /**
   * ContentImportForm constructor.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, ContentImporterInterface $content_importer) {
    $this->entityTypeManager = $entity_type_manager;
    $this->contentImporter = $content_importer;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('content_sync.importer')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'content_single_import_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['import'] = [
      '#title' => $this->t('Paste your content here'),
      '#type' => 'textarea',
      '#rows' => 24,
      '#required' => TRUE,
    ];

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import'),
      '#button_type' => 'primary',
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    try {
      // Decode the submitted import.
      $data = Yaml::decode($form_state->getValue('import'));
      // Store the decoded version of the submitted import.
      $form_state->setValueForElement($form['import'], $data);
      if (empty($data['_content_sync']['entity_type'])) {
        throw new \Exception($this->t('Entity type could not be determined.'));
      }
    } catch (\Exception $e) {
      $form_state->setErrorByName('import', $this->t('The import failed with the following message: %message', ['%message' => $e->getMessage()]));
      $this->logger('content_sync')
           ->error('The import failed with the following message: %message', [
             '%message' => $e->getMessage(),
             'link' => 'Import Single',
           ]);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $data = $form_state->getValue('import');
    $entity = $this->contentImporter->importEntity($data);
    if ($entity) {
      drupal_set_message($this->t('Entity @label (@entity_type: @id) imported successfully.', [
        '@label' => $entity->label(),
        '@entity_type' => $entity->getEntityTypeId(),
        '@id' => $entity->id(),
      ]));
    }
    else {
      drupal_set_message($this->t('Entity could not be imported.'), 'error');
    }
  }
}
