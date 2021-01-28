<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Defines a class to build a listing of Oska file entity entities.
 *
 * @ingroup htm_custom_oska
 */
class OskaFileEntityListBuilder extends EntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['name'] = $this->t('File name');
    $header['download'] = $this->t('Download');
    $header['delete'] = $this->t('Delete');
    return $header;
  }

  /**
   * {@inheritdoc}
   *
   */
  public function buildRow(EntityInterface $file_entity) {
    /**@var OskaFileEntity $file_entity*/

    $file_name = $file_entity->getFileId();

    $download_entity_file  = Url::fromUri($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/sites/default/files/private/oska_csv/'.$file_name.'.csv');
    $entity_download_link = Link::fromTextAndUrl(t('Download'), $download_entity_file);

    $row['name'] = $file_name;
    $row['download'] = $entity_download_link;
    $row['delete'] = Link::createFromRoute(
      'Kustuta',
      'entity.oska_file_entity.delete_form',
      ['oska_file_entity' => $file_entity->id()]
    );

    return $row;
  }
}
