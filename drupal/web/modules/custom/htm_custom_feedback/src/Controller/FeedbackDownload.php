<?php

namespace Drupal\htm_custom_feedback\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class FeedbackDownload.
 */
class FeedbackDownload extends ControllerBase {

  /**
   * Allfeedbacks.
   *
   * @return string
   *   Return Hello string.
   */
  public function AllFeedbacks() {
    return [
      '#type' => 'markup',
      '#markup' => $this->t('Implement method: AllFeedbacks')
    ];
  }

  private function queryFeedbacks(){
    $query_method = 'insert';
    $record = [
      'nid' => $node,
      'created' => time(),
      'feedback_type' => $feedback['type'],
      'feedback_message' => $feedback['message']
    ];
    $query = \Drupal::database()->$query_method('admin_feedback')->fields($record);
    $return = $query->execute();
    dump($return);
    return [];
  }

}
