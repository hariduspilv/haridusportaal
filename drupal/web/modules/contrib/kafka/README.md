# [Kafka] for [Drupal] 8

[Kafka]: https://kafka.apache.org/
[Drupal]:  https://drupal.org/


## Features

* Drupal 8 [Queue API] backend. Queue names map to Kafka topics.
  * Standard Drush commands to consume the queue: `drush queue-list` / `drush queue-run`
  * Code design documented in [`DESIGN.md`]
* (planned): [PSR-3] Log appender. Logger channels map to Kafka topics.
* Drush commands to 
  * check proper operation of the Queue API adapter
    * `drush kqpd`: producer demo via Queue API
    * `drush kqcd`: consumer demo via Queue API
    * Existing core `drush queue-run` command works
  * check proper operation of the high-level consumer, low-level
    consumer, and producer in relation with a Kafka instance, e.g.  check IP / 
    port / credentials: 
    * `drush kpd`: producer demo, extension-level
    * `drush khlcd`: high-level consumer demo, extension-level
    * `drush kllcd`: low-level consumer demo, extension-level
  * check available topics `drush kafka-topics`.

Based on [`php_rdkafka`] / [`librdkafka`].

[`DESIGN.md`]: docs/DESIGN.md
[`librdkafka`]: https://github.com/edenhill/librdkafka
[`php_rdkafka`]: https://github.com/arnaud-lb/php-rdkafka
[PSR-3]: http://www.php-fig.org/psr/psr-3/
[Queue API]: https://api.drupal.org/api/drupal/core%21core.api.php/group/queue/8.2.x


## License

Like any Drupal plugin, the module is licensed under the General Public License,
version 2.0 or later (SPDX: GPL-2.0+).


## Install

* Install the Drupal 8 site without the module.
* Get IP, port, and list of topics names for the Kafka 0.10 broker you will be using.
* Install the `librdkafka` client library.
* Install the `php-rdkafka` PHP extension version 1 or 2 (see "Requirements" for details).
* Install the module as usual.
* Configure Drupal `settings.php` to expose the Kafka queue, either as the 
  default queue backend, or for specific queue names, and point the services to
  the chosen Kafka brokers.

        $settings['queue_default'] = 'queue.kafka';
        $settings['queue_service_{queue_name}'] = 'queue.kafka';
        $settings['kafka'] = [
          'consumer' => [
            'brokers' => ['127.0.0.1']
          ],
          'producer' => [
            'brokers' => ['127.0.0.1'],
          ],
        ];


## Requirements

* Drupal 8.2.0 or later
* Apache Kafka 0.10.1.0 or later
* `libradkafka`
* `php-rdkafka` master 2016-11-01 or more recent
  * 2.0.0 or later for PHP 7.x
  * 1.0.0 or later for PHP 5.6.x
  * 0.9.1 is __NOT__ usable
  * In 2016-11, this means building the extension from sources.
* PHP 5.6.27 or more recent. Slightly earlier versions _might_ work but have not been evaluated


## Limitations

At this point:
 
  * The module does _not_ provide a "reliable" queue service in the Drupal sense
    (`ReliableQueueInterface`). See Kafka documentation about why this is so: 
    the exact reliability guarantees provided depend on the Kafka topic 
    configuration.
  * Using the module during site installation is not supported.
  
Topics handling:

  * In production instances, automatic topic creation/deletion is usually not
    enabled, for various reasons, so they need to be created and deleted out of 
    band. 
  * On development instances, you may configure automatic topic creation/deletion.
