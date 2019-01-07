<?php

namespace Drupal\content_sync\Controller;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Controller\ControllerBase;
use Drupal\content_sync\Element\ContentSyncMessage;

/**
 * Provides route responses for content_sync element.
 */
class ContentElementController extends ControllerBase {

  /**
   * Returns response for message close using user or state storage.
   *
   * @param string $storage
   *   Mechanism that the message state should be stored in, user or state.
   * @param string $id
   *   The unique id of the message.
   *
   * @return \Drupal\Core\Ajax\AjaxResponse
   *   An empty Ajax response.
   *
   * @throws \Exception
   *   Throws exception is storage is not set to 'user' or 'state'.
   *
   * @see \Drupal\content_sync\Element\ContentSyncMessage::setClosed
   */
  public function close($storage, $id) {
    if (!in_array($storage, ['user', 'state'])) {
      throw new \Exception('Undefined storage mechanism for Content Sync close message.');
    }
    ContentSyncMessage::setClosed($storage, $id);
    return new AjaxResponse();
  }
}
