<?php

namespace Drupal\varnish_purge_tags\Plugin\Purge\TagsHeader;

use Drupal\purge\Plugin\Purge\TagsHeader\TagsHeaderInterface;
use Drupal\purge\Plugin\Purge\TagsHeader\TagsHeaderBase;

/**
 * Sets and formats the default response header with cache tags.
 *
 * @PurgeTagsHeader(
 *   id = "varnish_tagsheader",
 *   header_name = "Cache-Tags",
 * )
 */
class CacheTags extends TagsHeaderBase implements TagsHeaderInterface {}
