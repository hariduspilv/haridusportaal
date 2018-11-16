<?php

namespace Drupal\elasticsearch_connector_autocomp\Plugin\search_api\data_type;

use Drupal\search_api\DataType\DataTypePluginBase;

/**
 * Provides a string data type.
 *
 * @SearchApiDataType(
 *   id = "text_ngram",
 *   label = @Translation("Fulltext (ngram)"),
 *   description = @Translation("Indexes field using the index's ngram analyzer (only useful if ngram analysis is enabled.)"),
 *   fallback_type = "text"
 * )
 */
class TextNgramDataType extends DataTypePluginBase {
}
