#PURGE CACHE WARMER
   
## INTRODUCTION
This module places updated versions of content that have been invalidated, into internal and external caches (a process known as cache warming).
 
## EXPLANATION 
As requests are made to the site, the URL Queuer module maintains a table mapping cache tags for the pages to URLs.   Once content edits/updates trigger Drupal core's internal cache invalidation, the invalidations are registered by the URL queuer module.  Url Queuer then triggers external invalidations by URL for purgers that support it.  

The Purge Cache Warmer module is a Purge Invalidation Plugin, that is fired for each URL invalidation.  It is intended to be executed after all other purgers have fired, and the caches are clear.  For every url invalidation invoked the warmer makes an external HTTP request to the site.
This ensures that for any page that is purged from cache a fresh copy is immediately reloaded into your caching architecture.
 
## REQUIREMENTS

 This module requires the following modules:
  * [Purge](https://drupal.org/project/purge)
  * [Purge Url Queuer](https://drupal.org/project/purge_url_queuer)

## CONFIGURATION
- Setup the Purge module (see instructions[here](https://drupal.org/project/purge)).
- Setup the Purge Url Queuer module (see instructions[here](https://drupal.org/project/purge_url_queuer)).
- `drush en purge_url_warmer --yes`
- Head over to admin/config/development/performance/purge
- Add the Purge Cache Warmer to the invalidators
- Reorder the invalidators so that Purge Cache Warmer is the last invalidator in the list
- To achieve accurate URL based cache invalidation, it is best to take a head start by training the traffic registry that purge_queuer_url maintains:
 wget -r -nd --delete-after -l100 --spider http://mydrupalsite/
 
## RECOMMENDATIONS
Since the module involves external calls back to the site it's recommended to disable `purge_processor_lateruntime` and instead process purge invalidations using an external cron invoking drush.
- `drush dis purge_processor_lateruntime` 
- `drush en purge_drush`
- To process the queue have your external cron invoke the following: `drush p-queue-work`
- Recommend running at a 1 minute external cron. 
 
 ## MAINTAINERS
 Current Maintainers:
 - [Adam Weingarten (adam.weingarten)](https://www.drupal.org/u/abhishek-anand)
 - [Abhishek Anand (abhishek_anand)](https://www.drupal.org/u/adamweingarten)
