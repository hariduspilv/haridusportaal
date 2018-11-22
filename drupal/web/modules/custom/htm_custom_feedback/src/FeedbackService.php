<?php

namespace Drupal\htm_custom_feedback;

use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\Core\Database\Connection;

/**
 * Class FeedbackService.
 */
class FeedbackService implements FeedbackServiceInterface {


	/**
	 * @var Connection
	 */
	private $connection;

	/**
	 * @var CacheTagsInvalidatorInterface
	 */
	private $cacheTagsInvalidator;


	/**
	 * FeedbackService constructor.
	 *
	 * @param Connection                    $connection
	 * @param CacheTagsInvalidatorInterface $cacheTagsInvalidator
	 */
	public function __construct(Connection $connection, CacheTagsInvalidatorInterface $cacheTagsInvalidator) {
		$this->connection = $connection;
		$this->cacheTagsInvalidator = $cacheTagsInvalidator;
  }

	/**
	 * @param null $feedback
	 * @param null $node
	 * @return \Drupal\Core\Database\StatementInterface|int|null
	 * @throws \Exception
	 */
	private function insertFeedback($node = null, $feedback = null){
	  $record = [
		  'nid' => $node,
		  'created' => time(),
		  'feedback_type' => $feedback['type'],
		  'feedback_message' => $feedback['message']
	  ];
	  $query = $this->connection->insert('htm_custom_feedback')->fields($record);
	  $return = $query->execute();

	  return $return;
  }

  private function insertScore($nid, $feedback, $count){
		$count = $count + 1;
	  ($feedback == 1) ? $yes = 1 : $no = 1;
	  ($feedback == 1) ? $total_score = 100 : $total_score = 0;
	  $record = [
	  	'nid' => $nid,
		  'count' => $count,
		  'yes_count' => $yes,
		  'no_count' => $no,
		  'total_score' => $total_score
	  ];
	  $query = $this->connection->insert('htm_custom_feedback_score')->fields($record);
	  $query->execute();
  }

  private function updateScore($score, $feedback_type){
		($feedback_type == 1) ? $score['yes_count'] += 1 : $score['no_count'] += 1;
		$score['count'] += 1;
		$score['total_score'] = round($score['yes_count'] / $score['count'] * 100);
		$id = array_shift($score);

		$this->connection->update('htm_custom_feedback_score')
			->fields($score)
			->condition('id', $id)
			->execute();
  }

  private function getCurrentNodeScore($nid){
		$query = $this->connection->select('htm_custom_feedback_score', 'hcfs')
			->fields('hcfs', ['id', 'count', 'yes_count', 'no_count', 'total_score'])
			->condition('nid', $nid)
			->execute()
			->fetchAll();
		return $query;
  }

  public function feedbackVote($nid, $feedback_type, $message){
		$vote = $this->insertFeedback($nid, ['type' => $feedback_type, 'message' => $message]);

		$node_score = $this->getCurrentNodeScore($nid);
		if(!$node_score){
			$count = 0;
			$this->insertScore($nid, $feedback_type, $count);
		}else{
			$score = (array) reset($node_score);
			$this->updateScore($score, $feedback_type);
		}
		$this->cacheTagsInvalidator->invalidateTags(['feedback_cache_tags']);

		return $vote;
  }







}
