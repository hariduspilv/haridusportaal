<?php

namespace Drupal\content_sync\Normalizer;

/**
 * User entity normalizer class.
 */
class UserEntityNormalizer extends ContentEntityNormalizer {


  /**
   * The interface or class that this Normalizer supports.
   *
   * @var string
   */
  protected $supportedInterfaceOrClass = 'Drupal\user\UserInterface';

  /**
   * {@inheritdoc}
   */
  public function denormalize($data, $class, $format = NULL, array $context = array()) {

    $entity = parent::denormalize($data, $class, $format, $context);

    // For security reasons the user 1 is not updated.
    if ((int) $entity->id() === 1) {
      return $entity->load(1);
    }

    return $entity;
  }

  /**
   * {@inheritdoc}
   */
  public function normalize($object, $format = NULL, array $context = array()) {
    $normalized_data = parent::normalize($object, $format, $context);
    if (!empty($context['content_sync'])) {
      $normalized_data['pass'] = [
        'value' => $object->getPassword(),
        'pre_hashed' => TRUE,
      ];
      $normalized_data['mail'] = [
        'value' => $object->getEmail(),
      ];
      $normalized_data['status'] = [
        'value' => $object->get('status')->value,
      ];
      $normalized_data['roles'] = $object->getRoles();
    }
    return $normalized_data;
  }

}
