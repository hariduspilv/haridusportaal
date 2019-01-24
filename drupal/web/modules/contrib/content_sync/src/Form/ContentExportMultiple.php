<?php

namespace Drupal\content_sync\Form;

use Drupal\content_sync\ContentSyncManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\user\PrivateTempStoreFactory;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Class ContentExportMultiple
 *
 * @package Drupal\content_sync_ui\Form
 */
class ContentExportMultiple extends ConfirmFormBase {

  use ContentExportTrait;

  /**
   * Entity type manager service.
   *
   * @var EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Private Temp Store Factory service.
   *
   * @var PrivateTempStoreFactory
   */
  protected $tempStoreFactory;

  /**
   * @var \Drupal\content_sync\ContentSyncManagerInterface
   */
  protected $contentSyncManager;

  /**
   * @var \Drupal\content_sync_ui\Toolbox\ContentSyncUIToolboxInterface
   */
  protected $contentSyncUIToolbox;

  /**
   * @var array
   */
  protected $entityList = [];

  protected $formats;

  /**
   * Constructs a ContentSyncMultiple form object.
   *
   * @param \Drupal\user\PrivateTempStoreFactory $temp_store_factory
   *   The tempstore factory.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $manager
   *   The entity type manager.
   */
  public function __construct(PrivateTempStoreFactory $temp_store_factory, EntityTypeManagerInterface $manager, ContentSyncManagerInterface $content_sync_manager, array $formats) {
    $this->tempStoreFactory = $temp_store_factory;
    $this->entityTypeManager = $manager;
    $this->contentSyncManager = $content_sync_manager;
    $this->formats = $formats;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('user.private_tempstore'),
      $container->get('entity_type.manager'),
      $container->get('content_sync.manager'),
      $container->getParameter('serializer.formats')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'content_sync_export_multiple_confirm';
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->formatPlural(count($this->entityList), 'Are you sure you want to export this item?', 'Are you sure you want to export these items?');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('system.admin_content');
  }

  /**
   * {@inheritdoc}
   */
  public function getConfirmText() {
    return t('Export');
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $this->entityList = $this->tempStoreFactory->get('content_sync_ui_multiple_confirm')
      ->get($this->currentUser()
        ->id());

    if (empty($this->entityList)) {
      return new RedirectResponse($this->getCancelUrl()
        ->setAbsolute()
        ->toString());
    }

    // List of items to export.
    $items = [];
    foreach ($this->entityList as $uuid => $entity_info) {
      $storage = $this->entityTypeManager->getStorage($entity_info['entity_type']);
      $entity = $storage->load($entity_info['entity_id']);
      if (!empty($entity)) {
        $items[$uuid] = $entity->label();
      }
    }
    $form['content_list'] = [
      '#theme' => 'item_list',
      '#title' => 'Content List.',
      '#items' => $items,
    ];

    $form = parent::buildForm($form, $form_state);
    return $form;
  }


  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    if ($form_state->getValue('confirm') && !empty($this->entityList)) {
      // Delete the content tar file in case an older version exist.
      file_unmanaged_delete($this->getTempFile());

      $entities_list = [];
      foreach ($this->entityList as $entity_info) {
        $entities_list[] = [
          'entity_type' => $entity_info['entity_type'],
          'entity_id' => $entity_info['entity_id'],
        ];
      }
      if (!empty($entities_list)) {
        $batch = $this->generateBatch($entities_list);
        batch_set($batch);
      }
    }
    else {
      $form_state->setRedirect('system.admin_content');
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function getEntityTypeManager() {
    return $this->entityTypeManager;
  }

  /**
   * {@inheritdoc}
   */
  protected function getContentExporter() {
    return $this->contentSyncManager->getContentExporter();
  }

  /**
   * {@inheritdoc}
   */
  protected function getExportLogger() {
    return $this->logger('content_sync');
  }

}
