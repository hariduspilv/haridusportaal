
Credits
-------

Thanks to Mark James for the icons
  http://www.famfamfam.com/lab/icons/silk/

To add a cron job you can use either hook_cron() or use configuration files with custom parameters
for multiple/additional cron jobs in a module.

The easiest way to declare a cron job is tu use hook_cron()
and then configure the cron job through the UI and export it, then change the cron jobs callback method.

Another way to register a cron job is to add a cron configuration object in a custom module.
In your custom module add in the sub directory my_module/config/optional a yaml file named
ultimate_cron.job.my_custom_cron_job_name.yml

For an example see the cron configuration of the simplenews module:
http://cgit.drupalcode.org/simplenews/tree/config/optional/ultimate_cron.job.simplenews_cron.yml

After installing the custom module the configuration will become available.
During development you can use the config_devel module to import configuration.

The cron configuration yaml file could look like:

langcode: en
status: true
dependencies:
  module:
    - user
title: 'Pings users'
id: user_ping
module: my_module
callback: _my_module_user_ping_cron
scheduler:
  id: simple
  configuration:
    rules:
      - '*/5+@ * * * *'
launcher:
  id: serial
  configuration:
    timeouts:
      lock_timeout: 3600
      max_execution_time: 3600
    launcher:
      max_threads: 1
logger:
  id: database
  configuration:
    method: '3'
    expire: 1209600
    retain: 1000

The following details of the cron job can be specified:
- "title": The title of the cron job. If not provided, the
  name of the cron job will be used.
- "module": The module where this job lives.
- "callback": The callback to call when running the job.
  Defaults to the job name.
- "scheduler": Default scheduler (plugin type) for this job.
- "launcher": Default launcher (plugin type) for this job.
- "logger": Default logger (plugin type) for this job.