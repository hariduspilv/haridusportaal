# Config Filter Split test
This is a module for testing the proper functioning of config_filter.
But it also demonstrates how a filter can be used to read and write to a
different config storage. As such it is an instructive example.
But it also has a practical purpose: We can use it to read migrate config
directly from files. Of course it is in general a bad idea to directly
edit the active configuration since Drupal does many checks and database
alterations when synchronizing configuration.

This is just here for the brave. You have been warned.

## Developing with migrate configuration read from the files.

Migrations are configurations, by default active configuration is stored in the
database. So when developing, the configuration has to be synced all the time.
To avoid this we can split out the migrate configuration to read directly
from the files.

Enable the config_filter_split_test testing module from config_filter.

To swap out the active storage, add the following to your services.local.yml:
```yaml
services:
  config.storage:
    class: Drupal\config_filter_split_test\Config\ActiveMigrateStorage
    arguments:
      - '@config.storage.active'
      - '@cache.config'
      - '../config/migrate_active' # The path to the folder.
```

Migrations are plugins, and plugin definitions are cached. The configuration
storage is also cached.
So either you have to clear the caches after you edit the migration or you add
the following to your settings.php (assuming you have the null cache set too):
```php
$settings['cache']['bins']['config'] = 'cache.backend.null';
$settings['cache']['bins']['discovery'] = 'cache.backend.null';
```
This has an obvious performance implication.
