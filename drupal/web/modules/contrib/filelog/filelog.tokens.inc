<?php

/**
 * @file
 * Builds placeholder replacement tokens for log messages.
 */

use Drupal\Core\Render\BubbleableMetadata;

/**
 * Implements hook_token_info().
 */
function filelog_token_info() {
  return [
    'types'  => [
      'log' => [
        'name'        => t('Log messages'),
        'description' => t('Tokens related to a log message.'),
        'needs-data'  => 'log',
      ],
    ],
    'tokens' => [
      'log' => [
        'type'     => [
          'name'        => t('Type'),
          'description' => t('The category of the log message.'),
        ],
        'level'    => [
          'name'        => t('Level'),
          'description' => t('The severity of the log message.'),
        ],
        'message'  => [
          'name'        => t('Content'),
          'description' => t('The message text, without HTML and with escaped line breaks.'),
        ],
        'location' => [
          'name'        => t('Location'),
          'description' => t('The requested URI.'),
        ],
        'referrer' => [
          'name'        => t('Referrer'),
          'description' => t('The referrer URL, if available.'),
        ],
        'ip'       => [
          'name'        => t('IP'),
          'description' => t('The IP of the user triggering the message.'),
        ],
        'created'  => [
          'name'        => t('Date'),
          'description' => t('The time when the message was created.'),
          'type'        => 'date',
        ],
        'user'     => [
          'name'        => t('User'),
          'description' => t('The user who triggered the message.'),
          'type'        => 'user',
        ],
        'variable' => [
          'name'        => t('Variable'),
          'description' => t('Variables in the message (available variables vary between messages).'),
          'dynamic'     => TRUE,
        ],
        'context'  => [
          'name'        => t('Context'),
          'description' => t('Context of the message (advanced usage).'),
          'dynamic'     => TRUE,
        ],
      ],
    ],
  ];
}

/**
 * Implements hook_tokens().
 *
 * @param string                                 $type
 * @param array                                  $tokens
 * @param array                                  $data
 * @param array                                  $options
 * @param \Drupal\Core\Render\BubbleableMetadata $metadata
 *
 * @return array
 */
function filelog_tokens($type, array $tokens, array $data, array $options, BubbleableMetadata $metadata) {
  $token_service = \Drupal::token();

  /** @var \Drupal\Core\Datetime\DateFormatterInterface $date_service */
  $date_service = \Drupal::service('date.formatter');

  $replacements = [];

  if ($type !== 'log') {
    return [];
  }

  /** @var \Drupal\filelog\LogMessage $message */
  $message = $data['log'];

  foreach ($tokens as $name => $original) {
    switch ($name) {
      case 'type':
        $replacements[$original] = $message->getType();
        break;

      case 'level':
        $replacements[$original] = $message->getLevel();
        break;

      case 'message':
        $replacements[$original] = $message->getText();
        break;

      case 'location':
        $replacements[$original] = $message->getLocation();
        break;

      case 'ip':
        $replacements[$original] = $message->getIP();
        break;

      // Accept both the correct and the RFC spelling here.
      case 'referrer':
      case 'referer':
        $replacements[$original] = $message->getReferrer();
        break;

      case 'created':
        $replacements[$original] = $date_service->format(
          $message->getTimestamp()
        );
        break;

      case 'user':
        $replacements[$original] = $message->getUser()->label();
        break;
    }
  }

  if ($user_tokens = $token_service->findWithPrefix($tokens, 'user')) {
    $replacements += $token_service->generate(
      'user',
      $user_tokens,
      ['user' => $message->getUser()],
      $options,
      $metadata
    );
  }

  if ($created_tokens = $token_service->findWithPrefix($tokens, 'created')) {
    $replacements += $token_service->generate(
      'date',
      $created_tokens,
      ['date' => $message->getTimestamp()],
      $options,
      $metadata
    );
  }

  if ($variable_tokens = $token_service->findWithPrefix($tokens, 'variable')) {
    foreach ($variable_tokens as $name => $original) {
      $replacements[$original] = $message->getVariable($name);
    }
  }
  if ($variable_tokens = $token_service->findWithPrefix($tokens, 'context')) {
    foreach ($variable_tokens as $name => $original) {
      $replacements[$original] = $message->getContext($name);
    }
  }

  return $replacements;
}
