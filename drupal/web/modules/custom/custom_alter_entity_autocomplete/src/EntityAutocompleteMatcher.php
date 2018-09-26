<?php

namespace Drupal\custom_alter_entity_autocomplete;

use Drupal\Component\Utility\Html;
use Drupal\Component\Utility\Tags;
use Drupal\taxonomy\Entity\Term;

class EntityAutocompleteMatcher extends \Drupal\Core\Entity\EntityAutocompleteMatcher {

    /**
     * Gets matched labels based on a given search string.
     */
    public function getMatches($target_type, $selection_handler, $selection_settings, $string = '') {
        $matches = [];

        $options = $selection_settings + [
                'target_type' => $target_type,
                'handler' => $selection_handler,
            ];

        if (isset($string)) {
            // Get an array of matching entities.
            $match_operator = !empty($selection_settings['match_operator']) ? $selection_settings['match_operator'] : 'CONTAINS';
            $query = \Drupal::entityQuery($options['target_type']);
            $query->condition('vid', $options['target_bundles']);
            $query->condition('name', $string, 'CONTAINS');
            $query->condition('langcode', \Drupal::languageManager()->getCurrentLanguage()->getId());
            $query->range(0,10);
            $values = $query->execute();
            $values = Term::loadMultiple($values);

            // Loop through the entities and convert them into autocomplete output.
            foreach ($values as $value) {
                $label = $value->getName();
                $entity_id = $value->id();
                $key = "$label ($entity_id)";
                $matches[] = ['value' => $key, 'label' => $label];
            }
        }

        return $matches;
    }

}