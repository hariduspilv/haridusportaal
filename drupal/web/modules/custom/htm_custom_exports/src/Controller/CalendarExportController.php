<?php

namespace Drupal\htm_custom_exports\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Eluceo\iCal\Component\Calendar;
use Eluceo\iCal\Component\Event;

//use \Drupal\Core\Datetime;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


/**
 * Class CalendarExportController.
 */
class CalendarExportController extends ControllerBase {

  /**
   * Calendarexport.
   *
   * @return Response
	 * Cal file
   */
  public function calendarexport(Request $request, NodeInterface $event_node_id) {

  	if($event_node_id->bundle() === 'event'){

			$config  = \Drupal::config('htm_custom_admin_form.customadmin');
			$language = \Drupal::languageManager()->getCurrentLanguage()->getId();

			$url = $config->get('general.fe_url');

			$vCalendar = new Calendar($url);
			$event_title  = $event_node_id->getTitle();
			$event_description = $event_node_id->field_description_summary->value;
			$event_location = ($location = $event_node_id->field_event_location->getValue()) ? $location[0] : NULL;

			$alias = \Drupal::service('path.alias_manager')->getAliasByPath('/node/'.$event_node_id->id());

			$vCalendar->setName($event_title);
  		foreach($event_node_id->referencedEntities() as $i => $refEnt){
  			if($refEnt instanceof Paragraph && $refEnt->bundle() === 'event_date'){
					$start_time = $refEnt->field_event_start_time->value;
					$end_time = $refEnt->field_event_end_time->value;
  				$event_date = strtotime($refEnt->field_event_date->value);

  				$i = date('d-m-Y H:i:s', (int) $event_date + (int) $start_time);
					$i2 = date('d-m-Y H:i:s',(int) $event_date + (int) $end_time);

					$d1 = new \DateTime($i);
					$d2 = new \DateTime($i2);

					$vEvent = new Event();
					$vEvent->setDtStart($d1)
							->setDtEnd($d2)
							->setSummary($event_title)
							->setUrl($url .'/' . $language . $alias)
							->setDescription($event_description);
					if($event_location) $vEvent->setLocation($event_location['name'], $event_location['name'], $event_location['lat'] . ',' . $event_location['lon']);

					$vCalendar->addComponent($vEvent);
				}
			}

			$filename = preg_replace('/[^a-zA-Z0-9õäöüÕÄÖÜ]/i', "_", $event_title);

			header('Content-Type: text/calendar; charset=utf-8');
			header('Content-Disposition: attachment; filename="'.$filename.'.ics"');

			$response = new Response();
			$response->sendHeaders();
			$response->setContent($vCalendar->render());

			return $response;
		}else{
  		return drupal_set_message('error');
		}
  }

}
