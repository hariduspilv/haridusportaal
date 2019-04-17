# Reverse Entity Reference

Reverse Entity Reference adds a computed reverse reference field to all entities
referenced by another entity's field. This module is based on
[Drupal 7 Entityreference Backreference](https://www.drupal.org/project/entityreference_backreference).
This modules only provides backreferences for entity_reference fields towards
fieldable entity types.

## Requirements

None

## Installation

- Install as usual, 
  see https://www.drupal.org/docs/8/extending-drupal-8/installing-modules
  for more information


## Configuration

- By default this module supports entity_reference, however it can support any reference field that is a subclass of EntityReferenceItem. Navigate to /admin/config/system/reverse-entity-reference to choose the reference items to support (this is a global setting atm)
- you can also consider using the code alternative (see below) but be careful of using field types that don't extend EntityReferenceItem because they might not work. 
- Also I have not tested on every class that extends EntityReferenceItem so it might not work in those cases either. 
- Covered field types:
   - File
   - Image
   - Entity Reference
```php
     $this->config('reverse_entity_reference.settings')
            ->set('allowed_field_types', $new_allowed_field_types_value)
            ->save();
```


## Example Usage
```php
$referencing_entities = \Drupal::service('entity_type.manager')
  ->getStorage($referenced_entity_type)
  ->load($referenced_entity_id)
  ->get('reverse_entity_reference')
  ->getValue();

$entity_ids = array_intersect(
  array_column($referencing_entities, 'referring_entity_type'),
  $referencing_entity_types
);

$field_names = array_intersect(
  array_column($referencing_entities, 'field_name'),
  $referencing_field_names
);

$wanted = array_intersect_key($referencing_entities, $entity_ids, $field_names);
```
The reverse\_entity\_referece field gives a table of all the entities that 
referencing this entity. If you want it for a specific field though you could
use the method shown above to filter out the information you don't need.

## Contributors

- Gerald Aryeetey (geraldnda) https://www.drupal.org/u/geraldnda
