<?php

namespace Drupal\purge_ui\Form;

/**
 * Provides a base class for queuer configuration forms.
 *
 * Derived forms will be rendered by purge_ui as modal dialogs through links at
 * /admin/config/development/performance/purge/queuer/ID/config/dialog. You
 * can use /admin/config/development/performance/queuer/purger/ID/config as
 * testing variant that works outside modal dialogs.
 */
abstract class QueuerConfigFormBase extends PluginConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected $parentId = 'edit-queue';

}
