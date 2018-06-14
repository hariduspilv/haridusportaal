<?php

namespace Drupal\htm_custom_event_registration\Controller;

use Drupal\Component\Datetime\Time;
use Drupal\Console\Bootstrap\Drupal;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Eluceo\iCal\Component\Calendar;
use Eluceo\iCal\Component\Event;

//use \Drupal\Core\Datetime;
use Drupal\Core\Datetime\DrupalDateTime;
use Eluceo\iCal\Component\Timezone;
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

  		/*TODO make calendar prodid configurable*/
			$vCalendar = new Calendar('www.htm.ee');

			$event_title  = $event_node_id->getTitle();
			$event_description = $event_node_id->field_description_summary->value;
			$event_location = ($location = $event_node_id->field_event_location->getValue()) ? $location[0] : NULL;

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
							->setDescription($event_description);
					if($event_location) $vEvent->setLocation($event_location['name'], $event_location['name'], $event_location['lat'] . ',' . $event_location['lon']);

					$vCalendar->addComponent($vEvent);
				}
			}

			header('Content-Type: text/calendar; charset=utf-8');
			header('Content-Disposition: attachment; filename="cal.ics"');

			$response = new Response();
			$response->setContent($vCalendar->render());

			return $response;
		}else{
  		return drupal_set_message('error');
		}
  }

}
