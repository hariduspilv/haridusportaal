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
  public function denormalize($data, $class, $format = NULL, array $context = []) {

    $entity = parent::denormalize($data, $class, $format, $context);

    // For security reasons the user 1 is not updated.
    if ((int) $entity->id() === 1) {
      return $entity->load(1);
    }
    // User 0 is not updated.
    if (!empty($data['_content_sync']['is_anonymous']) && (int) $entity->id() === 0) {
      return $entity->load(0);
    }
    return $entity;
  }

  /**
   * {@inheritdoc}
   */
  public function normalize($object, $format = NULL, array $context = []) {
    $normalized_data = parent::normalize($object, $format, $context);
    if (!empty($context['content_sync'])) {
      $normalized_data['pass'] = [
        [
          'value' => $object->getPassword(),
          'pre_hashed' => TRUE,
        ],
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

  /**
   * {@inheritdoc}
   */
  protected function getContentSyncMetadata($object, $context = []) {
    /** @var \Drupal\user\Entity\User $object */
    $metadata = parent::getContentSyncMetadata($object, $context);
    if ($object->isAnonymous()) {
      $metadata['is_anonymous'] = TRUE;
    }
    return $metadata;
  }
}
