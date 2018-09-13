<?php

/**
 * @file
 * Contains \Drupal\eayschart\Plugin\entity_embed\EntityEmbedDisplay\Easychart.
 */

namespace Drupal\easychart\Plugin\entity_embed\EntityEmbedDisplay;

use Drupal\Core\Form\FormStateInterface;
use Drupal\easychart\EasychartHelper;
use Drupal\entity_embed\EntityEmbedDisplay\EntityEmbedDisplayBase;


/**
 * Entity Embed Display to render Easycharts.
 *
 * @see \Drupal\entity_embed\EntityEmbedDisplay\EntityEmbedDisplayInterface
 *
 * @EntityEmbedDisplay(
 *   id = "easychart",
 *   label = @Translation("Easychart"),
 * )
 */
class Easychart extends EntityEmbedDisplayBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $output = [];
    $route_match = \Drupal::routeMatch();

    // We are in preview.
    if ($route_match->getRouteName() == 'embed.preview') {

      $show_placeholder = TRUE;

      // Try to render preview in the editor.
      $entity = $this->getEntityFromContext();
      if (!empty($entity)) {
        $values = $entity->easychart->getValue();
        if (!empty($values[0]['config'])) {
          $http_client = \Drupal::httpClient();
          $options = array();
          $options['options'] = $values[0]['config'];
          $options['type'] = 'image/png';
          $options['async'] = TRUE;
          $response = $http_client->post('http://export.highcharts.com', array('form_params' => (object) $options));
          if ($response->getStatusCode() == 200) {
            $body = $response->getBody();
            $content = $body->getContents();
            if (!empty($content)) {
              $show_placeholder = FALSE;
              $output = [
                '#markup' => '<img src="http://export.highcharts.com/' . $content . '">'
              ];
            }
          }
        }
      }

      // Show placeholder.
      if ($show_placeholder) {
        $output = [
          '#markup' => '<img src="' . base_path() . drupal_get_path('module', 'easychart') . '/assets/chart-placeholder.png">'
        ];
      }
    }
    // Otherwise, render the chart.
    else {

      $entity = $this->getEntityFromContext();
      if (!empty($entity)) {
        $delta = 0;
        $entity_id = $entity->id();
        $values = $entity->easychart->getValue();
        if ($output = EasychartHelper::easychartPrintChart($values[0], $entity_id, $delta)) {
          $element[$delta] = array('#markup' => $output['markup']);
          $element['#attached']['drupalSettings']['easychart'][$output['identifier']] = array(
            'config' => $output['config'],
            'csv' => $output['csv'],
          );
        }
      }

      if (!empty($element)) {
        EasychartHelper::addRenderLibraries($element);
        $output = $element;
      }
    }

    return $output;
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    return array();
  }
}
