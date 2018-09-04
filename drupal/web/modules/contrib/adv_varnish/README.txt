DESCRIPTION:
This module provide integration with Varnish reverse 
proxy server for Drupal 8. 
Main feature of this module is 
providing support of varnish 
caching for authenticated users.

MAIN FEATURES:
Varnish support out of the box.
All you need is to install this 
module use default.vcl from 
this module and fill connection 
settings for varnish terminal.

Cache for anonymous users.
Just set desired TTL in varnish 
settings and it will works, 
cache invalidation will happens 
automatically and depends on new 
Drupal 8 cache system with tags support.

Cache for authenticated users.
The same as for anonymous users 
just fill the TTL and Varnish will 
start to cache pages for authenticated 
users based on PER ROLE option. We all 
knows that page for authenticated 
users can contain user-specific 
content and we care about this. For 
each user-specific block you can 
choose to use ESI cache on PER-ROLE 
or PER-USER basis so each user will 
get proper content on the page.

Per Entity Cache settings.
You can select TTL on per entity (bundle) 
settings. This module supports basic 
entity types out of the box (node and 
taxonomy terms) but you can easily add 
support for any custom entity type all 
you need is to create small plugin and 
we will care of all other things for you.

Cache invalidation.
We use tags to control each page state, 
so if any entity which presents on page 
would be changed in Drupal, cache in 
Varnish would be invalidate immediately. 
Module support Drupal 8 cache system and 
use all available cache metadata so you can 
easy add required tags for any page that you want.
