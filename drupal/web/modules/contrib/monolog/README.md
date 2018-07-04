Monolog for Drupal 8
=======

Overview
-------
This module integrates Drupal with the fantastic [Monolog library by Seldaek](https://github.com/Seldaek/monolog) to provide a better logging solution. Some of the benefits of using this module are as follows:

- Configurable logging levels
- A multitude of handlers
- All the power and flexibility of Monolog

The Drupal Monolog module also has full watchdog integration, so it works with core and contributed modules out of the box.

Monolog sends your logs to files, sockets, inboxes, databases and various web services.
This module is a thin wrapper to integrate the Monolog library with the Drupal logging
system. For more information on how the Monolog library itself works, take a look to the
[documentation](https://github.com/Seldaek/monolog/blob/master/doc/01-usage.md).


Install
-------
The Monolog module needs to be installed via Composer, which will also download the required library.
Look at [Using Composer with Drupal](https://www.drupal.org/node/2404989) for further information.


Quick start
===========

Monolog module does not have an UI, all the configuration is done in services files.

You should create a site specific services.yml (monolog.services.yml for example) in the same
folder of your settings.php and then add this line to settings.php itself:

```
$settings['container_yamls'][] = 'sites/default/monolog.services.yml';
```

The simplest configuration that allows Monolog to log to a rotating file might be:

```
parameters:
  monolog.channel_handlers:
    default: ['rotating_file']
  monolog.processors: ['message_placeholder', 'current_user', 'request_uri', 'ip', 'referer']

services:
  monolog.handler.rotating_file:
    class: Monolog\Handler\RotatingFileHandler
    arguments: ['private://logs/debug.log', 10, 'monolog.level.debug']
```

This configuration will log every message with a log level greater (or equal) than *debug* to a file called
*debug.log* located into the *logs* folder in your private filesystem.
Files will be rotated every day and the maximum number of files to keep will be *10*.

How it works
============

Handlers
--------

Handlers are registered as services in the [Drupal Service Container](https://www.drupal.org/docs/8/api/services-and-dependency-injection/services-and-dependency-injection-in-drupal-8).
You can define as many handlers as you need.
Each handler has a name (that should be under the *monolog.handler.* namespace), an implementing class and a list of arguments.

Mapping among logger channels and Monolog handlers is done defining parameters.
Under the *monolog.channel_handlers* parameter it is possible to define where to send logs from a specific channel.
The *default* mapping should exist as the fallback one.
In the previous example all logs will be sent to the *monolog.handler.rotating_file* handler (note that only the handler name is used, not the full service name).

The following example will send all PHP specific logs to a separate file:

```
parameters:
  monolog.channel_handlers:
    php: ['rotating_file_php']
    default: ['rotating_file_all']
  monolog.processors: ['message_placeholder', 'current_user', 'request_uri', 'ip', 'referer']

services:
  monolog.handler.rotating_file_php:
    class: Monolog\Handler\RotatingFileHandler
    arguments: ['private://logs/php.log', 10, 'monolog.level.debug']
  monolog.handler.rotating_file_all:
    class: Monolog\Handler\RotatingFileHandler
    arguments: ['private://logs/debug.log', 10, 'monolog.level.debug']
```

The following method:

```
\Drupal::logger('php')->debug('debug message');
```

will write the corresponding message to the *private://logs/php.log* file.

Processors
----------

Monolog can alter the messages being written to a logging facility using *processors*. The module provides a set
of already defined processors to add information like the current user, the request uri, the client IP and so on.

Processors are defined as services under the *monolog.processor.* namespace.
We suggest you to use the [Devel module](https://www.drupal.org/project/devel) or [Drupal Console](https://drupalconsole.com) to find all of them.

Log to database
--------

The Monolog module automatically register an handler for every enabled Drupal logger. To log to the standard
watchdog table it is possible to enable the Database Logging module and use *drupal.dblog* as handler.

Examples
--------

* RotatingFileHandler: logs to filesystem
```
  monolog.handler.rotating_file_debug:
    class: Monolog\Handler\RotatingFileHandler
    arguments: ['public://logs/debug.log', 10, 'monolog.level.debug']
```

* SlackHandler: logs to a Slack channel
```
  monolog.handler.slack:
    class: Monolog\Handler\SlackHandler
    arguments: ['slack-token', 'monolog', 'Drupal', true, null, 'monolog.level.error']
```

* [FingersCrossedHandler](https://github.com/Seldaek/monolog/blob/master/doc/02-handlers-formatters-processors.md#wrappers--special-handlers)
```
  monolog.handler.fg:
    class: Monolog\Handler\FingersCrossedHandler
    arguments: ['@monolog.handler.slack', null, 100]
```

You can find the complete list of Processors/Handlers [here](https://github.com/Seldaek/monolog/blob/master/doc/02-handlers-formatters-processors.md#handlers).

Extending Monolog
--------

Handlers and Processors are Drupal/Symfony Services.
It is possible to define new ones or alter the existing ones just using Drupal 8 OOP standard approaches.
