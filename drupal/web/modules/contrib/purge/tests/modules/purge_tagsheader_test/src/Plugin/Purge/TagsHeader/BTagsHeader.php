<?php

namespace Drupal\purge_tagsheader_test\Plugin\Purge\TagsHeader;

use Drupal\purge\Plugin\Purge\TagsHeader\TagsHeaderBase;
use Drupal\purge\Plugin\Purge\TagsHeader\TagsHeaderInterface;

/**
 * Test header B.
 *
 * @PurgeTagsHeader(
 *   id = "b",
 *   header_name = "Header-B",
 * )
 */
class BTagsHeader extends TagsHeaderBase implements TagsHeaderInterface {}
