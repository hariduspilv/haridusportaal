<?php

namespace Drupal\htm_custom_feedback\Controller;

use Drupal\Core\Controller\ControllerBase;
use League\Csv\Writer;

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
    $new_items = [];

    #sort items by created date
    usort($items, function($a, $b)
    {
      return strcmp($b->created, $a->created);
    });

    foreach($items as $item){
      if(!in_array($item->id, $processed)){
        $item->created = date('d.m.Y H:i', $item->created);
        $new_items[] = (array) $item;
      }
      $processed[] = $item->id;
    }

    $csv = Writer::createFromFileObject(new \SplTempFileObject());
    $csv->setDelimiter(';');
    $csv->insertOne(['id', 'created', 'feedback_type', 'feedback_message', 'title']);
    $csv->insertAll($new_items);

    $csv->output('feedback.csv');
    die;
  }

  public function vote(){

  }

}
