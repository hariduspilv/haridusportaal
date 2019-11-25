<?php

namespace Drupal\purge_ui\Form;

/**
 * Provides a base class for processor configuration forms.
 *
 * Derived forms will be rendered by purge_ui as modal dialogs through links at
 * /admin/config/development/performance/purge/processor/ID/config/dialog. You
 * can use /admin/config/development/performance/purge/processor/config/ID as
 * testing variant that works outside modal dialogs.
 */
abstract class ProcessorConfigFormBase extends PluginConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected $parentId = 'edit-queue';

}
