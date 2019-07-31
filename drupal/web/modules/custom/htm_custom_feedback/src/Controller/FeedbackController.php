<?php

namespace Drupal\htm_custom_feedback\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class FeedbackController.
 */
class FeedbackController extends ControllerBase {

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

  private function createFeedback($feedback = null, $node = null){
    #$user = \Drupal::currentUser()
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

  private function downloadFeedback(){
    $query = \Drupal::database()->query("SELECT DISTINCT ON (f.id) f.id, r.title, 
to_char(to_timestamp(f.created), 'DD.MM.YYYY HH24:MI:SS'), f.feedback_type, f.feedback_message 
FROM htm_custom_feedback f 
JOIN node_field_revision r 
ON r.nid = f.nid 
ORDER BY f.id, r.title DESC");

    $result = $query->fetchAll();
    kint($result);
  }

  public function vote(){

  }

}
