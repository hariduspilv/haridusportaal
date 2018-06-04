# Image Style Warmer

Project page: https://drupal.org/project/image_style_warmer


## Introduction

The Image Style Warmer module provides options to create image styles during upload or
via queue worker. So configured image derivates already exists when they are requested.


## Requirements

- Image module from Drupal core


## Installing

__Versions 8.x-1.x:__ Install as usual, see the [official documentation](https://www.drupal.org/documentation/install/modules-themes/modules-8)
for further information.


## Configuration

- Go to _Manage > Configuration > Development > Performance > Image Style Warmer_.
  - Select image styles which should be created during upload.
  - Select image style which should be created via queue worker.
- Save _Image Style Warmer_ settings.
- Enable queue worker via _drush queue-run image_style_warmer_pregenerator_.


## Support

File bugs, feature requests and support requests in the [Drupal.org issue queue
of this project](https://www.drupal.org/project/issues/image_style_warmer).


## Maintainers

Current maintainers for Image Style Warmer:
- [IT-Cru](https://www.drupal.org/u/IT-Cru)
