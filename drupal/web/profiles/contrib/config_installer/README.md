# Configuration Installer

* Introduction
* Installation
* Usage
* Known issues


## Introduction

The Configuration Installer project provides a means to install a Drupal 8 site
using existing configuration.

This is not a module, Configuration Installer is an installation profile that
loads configuration from a specified folder to 'install' the site.
This is not a real installation profile either, it helps to install a real
installation profile (e.g. minimal) along with an existing set of configuration.


## Installation

Download the archive from the Drupal.org project page (or use Composer).

- https://www.drupal.org/project/config_installer
- `composer require drupal/config_installer`

The folder should be placed in the Drupal website root folder in:

`/profiles/contrib`


## Usage

Install the site like you normally would (e.g. through the UI, using drush
or drupal console). Note that it's probably better to install Drupal the first
time using the minimal profile. This will avoid conflicts when importing
the configuration (e.g. existing entities).

Edit the `sites/[yoursite]/settings.php` file and add the following line at the
bottom if it does not exist yet, or change the existing line to match:

```php
$config_directories['sync'] = '/path/to/folder/with/configuration';
```

Make sure user running the drush commands has read and write permissions
to the folder. If you are installing via the web, the webserver will need read
permissions as well.

You can now choose to change any configuration value in the administration
user interface (e.g. the site name) or create new configuration (e.g. a content
type or a view).

You can export your current configuration via drush:

```bash
drush config-export
```

Make sure to create a backup before dropping all tables from the database.

Then re-install the site with the following command:

```bash
drush site-install --verbose config_installer config_installer_sync_configure_form.sync_directory=/path/to/folder/with/configuration --yes
```

Once Drush completes the installation visit the site to confirm the
configuration has been used to install the site.


@TODO: add some (more) tips for install hooks, etc?
