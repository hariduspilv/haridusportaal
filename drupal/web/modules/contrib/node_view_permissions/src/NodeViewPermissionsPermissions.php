<?php

namespace Drupal\node_view_permissions;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\NodeType;

/**
 * Class definition.
 *
 * @category NodeViewPermissionsPermissions
 *
 * @package Access Control
 */
class NodeViewPermissionsPermissions {
  use StringTranslationTrait;

  /**
   * Permission function.
   *
   * Added the permissions.
   */
  public function permissions() {
    $permissions = [];
    $nodeTypes = NodeType::loadMultiple();
    foreach ($nodeTypes as $nodeType) {
      /** @var \Drupal\node\Entity\NodeType $nodeType */
      $permission = 'view any ' . $nodeType->id() . ' content';
      $permissions[$permission] = [
        'title' => $this->t('<em>@type_label</em>: View any content', ['@type_label' => $nodeType->label()]),
      ];
      $permission = 'view own ' . $nodeType->id() . ' content';
      $permissions[$permission] = [
        'title' => $this->t('<em>@type_label</em>: View own content', ['@type_label' => $nodeType->label()]),
      ];
    }
    return $permissions;
  }

}
