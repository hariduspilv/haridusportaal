<?php

/**
 * @file
 * Views integration.
 */

/**
 * Implements hook_views_data().
 */
function externalauth_views_data() {
  $data = [];

  $data['authmap'] = [
    // Table.
    'table' => [
      'group' => t('External Authentication Map'),
      'join' => [
        'users_field_data' => [
          'left_field' => 'uid',
          'field' => 'uid',
        ],
      ],
    ],
    'provider_field' => [
      'real field' => 'provider',
      'title' => t('Provider'),
      'help' => t('The name of the authentication provider providing the authname.'),
      'field' => [
        'id' => 'standard',
      ],
      'sort' => [
        'id' => 'standard',
      ],
      'filter' => [
        'id' => 'string',
      ],
      'argument' => [
        'id' => 'string',
      ],
    ],
    'authname' => [
      'title' => t('Authname'),
      'help' => t('Unique authentication name provided by authentication provider.'),
      'field' => [
        'id' => 'standard',
      ],
      'sort' => [
        'id' => 'standard',
      ],
      'filter' => [
        'id' => 'string',
      ],
      'argument' => [
        'id' => 'string',
      ],
    ],
  ];

  return $data;
}
