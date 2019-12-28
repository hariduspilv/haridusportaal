SVG image field
===============

CONTENTS OF THIS FILE
---------------------

  * Introduction
  * Requirements
  * Installation
  * Configuration
  * Author
  * Similar projects and how they are different

INTRODUCTION
------------

Standard image field in Drupal 8 doesn't support SVG images. If you really want
to display SVG images on your website then you need another solution. This
module adds a new field, widget and formatter, which allows svg file extension
to be uploaded.
Module based on core image and file modules and contrib svg_formatter.
In formatter settings you can set default image size and enable
alt and title attributes.

REQUIREMENTS
------------

Image

INSTALLATION
------------

1. Install module as usual via Drupal UI, Drush or Composer.
2. Go to "Extend" and enable the SVG image field module.

CONFIGURATION
----------------

1. Add "Svg Image" field to your content type or taxonomy vocabulary.
2. Go to the 'Manage display' => formatter settings and set image dimensions
 if you want and enable or disable attributes.

AUTHOR
------

shmel210  
Drupal: (https://www.drupal.org/user/2600028)  
Email: shmel210@zina.com.ua

Company: Zina Design Studio
Website: (http://zina.com.ua)  
Drupal: (https://www.drupal.org/user/361734/)  
Email: info@zina.com.ua

SIMILAR PROJECTS AND HOW THEY ARE DIFFERENT
-------------------------------------------
Limitations of module svg_formatter
- There is no way to set custom alt on image because it uses file field.
 File field does not support alt on db level.
- User must add svg extension at file field  settings and 
select field formatter its not intuitive for user.
- If user uploads non svg file it will break output.
- if user uploads png and selects inline output at formatter settings it will
 break output
- It not have preview image on file upload.
- There is less ways what we can do with this all without breaking 
existiing installations

Module svg_image_field does not have this weaks.
You simply click add field, set field type to "Svg Image" and its done. 
As for me there is much less ways to shoot yourself in the leg 
with svg_image_field:)
