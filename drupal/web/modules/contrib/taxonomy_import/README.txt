CONTENTS OF THIS FILE
---------------------
   
 * Introduction
 * Requirements
 * Installation
 * Configuration
 * Maintainers

INTRODUCTION
------------

This module can be used to create taxonomy terms 
by importing data from CSV or XML file to a specified
Vocabulary.

REQUIREMENTS
------------

This module requires the following:
A CSV or XML file of Taxonomy terms to import.
The .csv file can have two or more columns,eg:- name, parent.
The first column is taken as Name and second column is taken as Parent of the Taxonomy Term created. The first row will be the headers.
The .xml file can have two tags, eg:- <name>,<parent>.
Refer the example given in the module folder XML_Test.xml, CSV_Test.csv.

INSTALLATION
------------

Install as usual,
see https://www.drupal.org/docs/8/extending-drupal-8/
for further information.

CONFIGURATION
-------------

After successfully installing the module taxonomy_import, 
you can create a vocabulary and save terms to it provided 
via the file import.

Install the module taxonomy_import.

Go to Configuration and select Taxonomy Import from 
Content Authoring.
 
It will redirect you to Taxonomy Import Form, with two 
fields: Vocabulary name and Import file.

For a Taxonomy term, the two main fields are its Name and Relations.
Before selecting the file, you need to consider that this module create taxonomy terms with a name and a parent. So these data should come first in your file.

Give values to the fields. The file Imported should be
a CSV or XML. 

Click on Import which redirects you to admin/structure/
taxonomy/manage/<vocabulary name>/overview page. 

If .csv file contains two colums, the first column value is set as Name and second column value is set as Parent. For creating heirarchy based taxonomy, the values in the second column should come in the first column at the beginning of the file.

Similarly .xml file can have two or more tags with values from which first value will be saved to Name and second value will be saved to Parent fields of taxonomy respectively. 

You can reuse the Vocabulary name to import taxonomy terms again.

MAINTAINERS
-----------
1) Sajini Antony

2) Neethu P S
