<?php

namespace Drupal\purge_ui\Form;

/**
 * Provides a base class for purger configuration forms.
 *
 * Derived forms will be rendered by purge_ui as modal dialogs through links at
 * /admin/config/development/performance/purge/purger/ID/config/dialog. You
 * can use /admin/config/development/performance/purge/purger/config/ID as
 * testing variant that works outside modal dialogs.
 */
abstract class PurgerConfigFormBase extends PluginConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected $parentId = 'edit-purgers';

}
