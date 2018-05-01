Duration Field

####################
## Overview
####################

This module creates a new Form API form element of type duration,
as well as a Field API field of type duration. A duration is a time period,
for which the granularity can be adjusted to collect any or all of years,
months, days, hours, minutes and seconds.

This module makes no assumptions as to the type of duration a user would
want to collect, so as such, a user could choose to collect years and seconds
only, if they wish, though generally that wouldn't make sense.

Dates are stored in the system as ISO 8601 Durations.

####################
## Form API Element
####################

New form elements can be created within the Form API as follows:

<?php
$element['duration'] = [
  '#type' => 'duration',
  '#title' => t('Duration'),
  '#granularity' => 'y:d:m:h:i:s',
  '#required_elements' => 'y:d:m:h:i:s',
  '#default_value' => 'P1Y2M3DT4H5M6S',
];
?>

* #granularity - A list of elements to show, separated by colons. Included elements will be shown in the form element.
    y - years
    m - months
    d - days
    h - hours
    i - minutes
    s - seconds

    Default - y:m:d:h:i:s

*   #elements - A list of elements to be required, separated by colons. Elements listed will be required within in the form element. Keys are the same as for #granularity
*   #default_value' - The default value for the element, in Iso8601 duration format.

###########################################
## Working with the field value programmatically
###########################################

The field value can be used to construct a DateInterval object as follows:

<?php
$duration = new \DateInterval($field_value);

// Output years:
$duration->format('%y');

// Output months:
$duration->format('%m');

// Output days:
$duration->format('%d');

// Output hours:
$duration->format('%h');

// Output minutes:
$duration->format('%i');

// Output seconds:
$duration->format('%s');
?>

