CONTENTS OF THIS FILE
---------------------

 * Introduction
 * Requirements
 * Installation
 * Configuration
 * Maintainers


INTRODUCTION
------------

The File Log complements the core Database Log module with a logger that writes
events to a file.

Features:

 * The log message format is configurable (using the Token system).
 * The files are written to site/default/files/logs by default, but can be
   created in any location that PHP can access.
 * The verbosity of the file log is configurable, so that only events above a
   specific severity are recorded.
 * Drupal can automatically rotate the log file on a daily, weekly or monthly
   basis, either deleting or archiving/compressing the old log file to a new
   location.
 * Legacy support.

 * For a full description of the module visit:
   https://www.drupal.org/project/filelog

 * To submit bug reports and feature suggestions, or to track changes visit:
   https://www.drupal.org/project/issues/filelog


REQUIREMENTS
------------

This module requires no modules outside of Drupal core.


INSTALLATION
------------

Install the File Log module as you would normally install a contributed Drupal
module. Visit https://www.drupal.org/node/1897420 for further information.


CONFIGURATION
-------------

    1. Navigate to Administration > extend and enable the File Log module.
    2. After installing the module, it will automatically begin logging to
       ./logs/drupal.log inside Drupal's file system, usually in
       sites/default/files/. (The location is automatically protected from the
       web by .htaccess)
    3. To customize Logging and error settings, navigate to Administration >
       Configuration > Development > Logging and errors.
    4. The location can be configured, including setting it to an absolute path.
    5. The format of each log entry is configurable, and uses Drupal's token
       system. The available tokens are shown in the form; a full overview is
       provided if the Token module is enabled.
    6. The message text is automatically stripped of HTML and escape sequences,
       and newline characters are escaped as \n to ensure a single line per
       event. (Note that some messages, like PHP stack traces, can be quite long
       and hard to read in this form.)
    7. The log file can be automatically rotated (moved to a new location or
       deleted) on a monthly, weekly or daily basis, with optional gzip
       compression.
    8. Save configuration.


MAINTAINERS
-----------

 * Christoph Burschka (cburschka) - https://www.drupal.org/u/cburschka

Supporting organization:

 * PwC's Experience Center - https://www.drupal.org/pwcs-experience-center
