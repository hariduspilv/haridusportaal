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

  public function downloadFeedback(){
    $connection = \Drupal::database();

    $query = $connection->select('htm_custom_feedback', 'f')
      ->fields('f', ['id', 'created','feedback_type', 'feedback_message'])
      ->fields('r', ['title'])
      ->where("r.langcode = 'et'")
      ->orderBy('f.id');
    $query->leftJoin('node_field_revision', 'r', 'f.nid = r.nid');

    $items = $query->distinct()->execute()->fetchAll();

    $processed = [];
    foreach($items as &$item){
      if(in_array($item->id, $processed)){
        unset($item);
      }
    }
    kint($items);

  }

  public function vote(){

  }

}
