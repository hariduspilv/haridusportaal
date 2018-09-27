<?php

namespace Drupal\shs\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Language\LanguageInterface;
use Drupal\shs\Cache\ShsCacheableJsonResponse;
use Drupal\shs\Cache\ShsTermCacheDependency;

/**
 * Controller for getting taxonomy terms.
 */
class ShsController extends ControllerBase {

  /**
   * Load term data.
   *
   * @param string $identifier
   *   Name of field to load the data for.
   * @param string $bundle
   *   Bundle (vocabulary) identifier to limit the return list to a specific
   *   bundle.
   * @param integer $entity_id
   *   Id of parent term to load all children for. Defaults to 0.
   *
   * @return CacheableJsonResponse
   *   Cacheable Json response.
   */
  public function getTermData($identifier, $bundle, $entity_id = 0) {
    $context = [
      'identifier' => $identifier,
      'bundle' => $bundle,
      'parent' => $entity_id,
    ];
    $response = new ShsCacheableJsonResponse($context);

    $cache_tags = [];
    $result = [];

    $langcode_current = \Drupal::languageManager()->getCurrentLanguage(LanguageInterface::TYPE_CONTENT)->getId();
    $entity_manager = \Drupal::getContainer()->get('entity.manager');
    $storage = $entity_manager->getStorage('taxonomy_term');

    $translation_enabled = FALSE;
    if (\Drupal::moduleHandler()->moduleExists('content_translation')) {
      /** @var \Drupal\content_translation\ContentTranslationManagerInterface $translation_manager */
      $translation_manager = \Drupal::service('content_translation.manager');
      // If translation is enabled for the vocabulary, we need to load the full
      // term objects to get the translation for the current language.
      $translation_enabled = $translation_manager->isEnabled('taxonomy_term', $bundle);
    }
    $terms = $storage->loadTree($bundle, $entity_id, 1, $translation_enabled);

    foreach ($terms as $term) {
      $langcode = $langcode_current;
      if ($translation_enabled && $term->hasTranslation($langcode)) {
        $term = $term->getTranslation($langcode);
      }
      else {
        $langcode = $term->default_langcode;
      }

      $tid = $translation_enabled ? $term->id() : $term->tid;
      $result[] = (object) [
        'tid' => $tid,
        'name' => $translation_enabled ? $term->getName() : $term->name,
        'description__value' => $translation_enabled ? $term->getDescription() : $term->description__value,
        'langcode' => $langcode,
        'hasChildren' => shs_term_has_children($tid),
      ];
      $cache_tags[] = sprintf('taxonomy_term:%d', $tid);
    }

    $response->addCacheableDependency(new ShsTermCacheDependency($cache_tags));
    $response->setData($result, TRUE);

    return $response;
  }

}
