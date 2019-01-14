<?php

namespace Drupal\htm_custom_entity_autocomplete;

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
            #dump($options['target_type']);
            $query = \Drupal::entityQuery($options['target_type']);
            if($options['target_type'] == 'node'){
                $query->condition('type', $options['target_bundles']);
                $query->condition('title', $string, 'CONTAINS');
            }if($options['target_type'] == 'taxonomy_term'){
                $query->condition('vid', $options['target_bundles']);
                $query->condition('name', $string, 'CONTAINS');
            }
            $query->condition('langcode', \Drupal::languageManager()->getCurrentLanguage()->getId());
            $query->range(0,10);
            $values = $query->execute();
            $values = \Drupal::entityTypeManager()->getStorage($options['target_type'])->loadMultiple($values);
            // Loop through the entities and convert them into autocomplete output.
            foreach ($values as $value) {
                $label = $value->label();
                $entity_id = $value->id();
                $key = "$label ($entity_id)";
                $matches[] = ['value' => $key, 'label' => $label];
            }
        }

        return $matches;
    }

}