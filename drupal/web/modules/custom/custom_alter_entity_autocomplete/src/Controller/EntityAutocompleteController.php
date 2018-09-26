<?php

namespace Drupal\custom_alter_entity_autocomplete\Controller;

use Drupal\Core\KeyValueStore\KeyValueStoreInterface;
use Drupal\custom_alter_entity_autocomplete\EntityAutocompleteMatcher;
use Symfony\Component\DependencyInjection\ContainerInterface;

class EntityAutocompleteController extends \Drupal\system\Controller\EntityAutocompleteController {

    /**
     * The autocomplete matcher for entity references.
     */
    protected $matcher;

    /**
     * {@inheritdoc}
     */
    public function __construct(EntityAutocompleteMatcher $matcher, KeyValueStoreInterface $key_value) {
        $this->matcher = $matcher;
        $this->keyValue = $key_value;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container) {
        return new static(
            $container->get('custom_alter_entity_autocomplete.autocomplete_matcher'),
            $container->get('keyvalue')->get('entity_autocomplete')
        );
    }

}