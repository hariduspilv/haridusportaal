# Multilingual menu links for Drupal 8

The "link" field for menu items is not translatable - this is fine for internal links
since Drupal knows which version to reference automatically.

This can be a problem for external links, as there might be a need to provide a different URL
based on the link language.

This module creates a "Provide Translated External Link" option in the menu link form for translated items.

When enabled, it replaces the Link and Title fields with versions that are language specific. 

The current recommendation is to create language specific menus. This module eliminates the need for that.

Currently, the revised links get added in a preprocess hook. I'm hoping to make this happen in an earlier stage
in a future update.

Create an installable module with 
`git clone git@github.com:bbenjamin/Drupal-8---Multilingual-Menu-Links.git multilingual_menu_urls`