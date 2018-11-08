<?php

namespace Drupal\search_api_autocomplete\Utility;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Access\AccessResultReasonInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\search_api_autocomplete\SearchInterface;

/**
 * Provides helper methods for creating autocomplete suggestions.
 */
class AutocompleteHelper implements AutocompleteHelperInterface {

  /**
   * {@inheritdoc}
   */
  public function splitKeys($keys) {
    $keys = ltrim($keys);
    // If there is whitespace or a quote on the right, all words have been
    // completed.
    if (rtrim($keys, " \"") != $keys) {
      return [rtrim($keys, ' '), ''];
    }
    if (preg_match('/^(.*?)\s*"?([\S]*)$/', $keys, $m)) {
      return [$m[1], $m[2]];
    }
    return ['', $keys];
  }

  /**
   * {@inheritdoc}
   */
  public function alterElement(array &$element, SearchInterface $search, array $data = []) {
    $element['#type'] = 'search_api_autocomplete';
    $element['#search_id'] = $search->id();
    $element['#additional_data'] = $data;
  }

  /**
   * {@inheritdoc}
   */
  public function access(SearchInterface $search_api_autocomplete_search, AccountInterface $account) {
    $search = $search_api_autocomplete_search;
    $permission = 'use search_api_autocomplete for ' . $search->id();
    $access = AccessResult::allowedIf($search->status())
      ->andIf(AccessResult::allowedIf($search->hasValidIndex() && $search->getIndex()->status()))
      ->andIf(AccessResult::allowedIfHasPermissions($account, [$permission, 'administer search_api_autocomplete'], 'OR'))
      ->addCacheableDependency($search);
    if ($access instanceof AccessResultReasonInterface) {
      $access->setReason("The \"$permission\" permission is required and autocomplete for this search must be enabled.");
    }
    return $access;
  }

}
