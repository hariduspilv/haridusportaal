<?php

namespace Drupal\monolog\Logger\Processor;

/**
 * Parse and replace message placeholders for DrupalHandler.
 */
class DrupalMessagePlaceholderProcessor extends MessagePlaceholderProcessor {

  /**
   * {@inheritdoc}
   */
  public function __invoke(array $record): array {
    // Populate the message placeholders and then replace them in the message.
    $message_placeholders = $this
      ->parser
      ->parseMessagePlaceholders(
        $record['message'],
        $record['context']
      );
    $record['drupal_message'] = $record['message'];
    $record['message'] = empty($message_placeholders)
      ? $record['message']
      : strtr($record['message'], $message_placeholders);

    // Remove the replaced placeholders from the context to prevent logging the
    // same information twice.
    foreach ($message_placeholders as $placeholder => $value) {
      $record['drupal_context_placeholders'][$placeholder] = $value;
      unset($record['context'][$placeholder]);
    }

    return $record;
  }

}
