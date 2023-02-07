<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Interfaces;

use Drupal\graphql\Plugin\GraphQL\Interfaces\InterfacePluginBase;

/**
 * @GraphQLInterface(
 *   id = "meta_tag",
 *   name = "Metatag",
 *   type = "metatag",
 *   description = @Translation("Metatag interface containing metatag properties.")
 * )
 */
class Metatag extends InterfacePluginBase {

}
