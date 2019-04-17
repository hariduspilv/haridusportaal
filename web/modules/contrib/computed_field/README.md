# Computed field
## Description
This is a complete rewrite of the former computed field module to separate field types more precisely.
It now provides five field types, whose values are computed by PHP-code you provide in the field settings.
 
 * **Computed decimal**. A numeric field type with precision and scale, and optional prefix and suffix.
 * **Computed float**. Another numeric field type with optional prefix and suffix.
 * **Computed integer**. This is a numeric field type for numbers without decimals, with optional prefix and suffix.
 * **Computed string**. This is a character field type with a given maximum of characters.
 * **Computed string** (long). This is like above, but with unlimited length.

Besides the data types this module also provides some field formatters for each type, like the core field types:

 * **Unformatted** displays the value as is.
 * **Default** allows to add prefix, suffix, thousands separator (numeric field types only)

All these formatters allow to set cache duration. By default, cache settings are left untouched (default) which is in most cases correct. But if the PHP-code consists of volatile elements, like time/date dependent values you should set the cache duration accordingly.

**Attention!**

> Unlike prior versions computed fields don't have a display code anymore. This is due to the fact, that display code is formatting and formatting is not field definition. But now you can have different formatters for different view modes.


## Usage

* Download and install the module as usual. No additional configuration is needed.
* Add the computed field(s) to your bundles.
* Go to the tab "Manage form display" and at least save the form. This is **necessary**, even if you don't change anything else!
* If there is currently no content of that bundle, you can safely move the computed fields to the *Disabled* area. But if there is content, don't do that otherwise the computed values for existing content would not be created. Normally the fields are not displayed in the form unless you have defined the computed field as *multiple*. Then an (almost) empty table with drag options appears. This seems to be "normal" Drupal behaviour. You can solve this only by moving the computed field to the *Disabled* area with the implications above.
* Go to the tab "Manage display" and drag the field into the correct order. Then you can select and configure the formatter. **Don't forget to hit the *Save* button to store your changes** otherwise they are lost.
* It's always a good idea to **rebuild the cache** if you are playing around with the computed fields. 

## Additional modules
There are two additional modules you could enable:
### Computed field example formatter
This module provides an example to create your own PHP formatter for a computed field. To do so see below.
### Computed field PHP formatter
This module provides the ability to define the formatter code on the fly everywhere a formatter can be specified (this is also true for views!). As this can be dangerous, especially if users can define their own views, activate this module only if really needed. It is almost better to define the formatter in a separate module than on the fly!

## Examples
### See the difference between cache *default* and cache *off* or *duration*
To see the effects of caching you can follow this little example:

* Add two computed integers to the bundle.
* In both field set the PHP code to "`$value = time();`".
* Go to *Manage form display* and hit *Save*.
* Go to *Manage display* and set caching in one of the field to *off* or a certain duration. Leave the other field as is! Hit *Save* again.
* Add content or view existing content for that bundle.
* Refresh the screen.

Now you can see that one field keeps its value while the other field counts the time (in intervals you have set with the cache duration).

*This does not work if you have developer settings with caching set off!*

### Create your own PHP formatter
To create you own PHP formatter, clone the provided **computed_field_example_formatter** as follows:

* create a new module folder *modules/my_module* or (better) *modules/custom/my_module*.
* copy the contents of the *computed_field_example_formatter* folder to *my_module*.
* rename *computed_field_example_formatter.info.yml* file to *my_module_formatter.info.yml*. Modify name and description within the file as needed.
* rename *ComputePhpFormatterExample.php* file (in *src/Plugin/field/FieldFormatter*) to *myModuleFormatter.php*
* in this file change all occurrences of *ComputedPhpFormatterExample* to *MyModuleFormatter*
* In the annotations section *@FieldFormatter* change *id* and *label* to your needs.
* Modify the body of the method *formatItem* as needed.
* Install your module, or rebuild the cache to let drupal read in the annotations, if your module is already installed.

## Credits
@todo: add credits
