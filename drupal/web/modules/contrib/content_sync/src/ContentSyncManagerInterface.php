<?php

namespace Drupal\content_sync;


/**
 * Interface ContentSyncManagerInterface.
 *
 * @package Drupal\content_sync
 */
interface ContentSyncManagerInterface {

  /**
   * @return \Drupal\content_sync\Importer\ContentImporterInterface
   */
  public function getContentImporter();

  /**
   * @return \Drupal\content_sync\Exporter\ContentExporterInterface
   */
  public function getContentExporter();

  /**
   * @return \Symfony\Component\Serializer\Serializer
   */
  public function getSerializer();

  /**
   * @return \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  public function getEntityTypeManager();

}
