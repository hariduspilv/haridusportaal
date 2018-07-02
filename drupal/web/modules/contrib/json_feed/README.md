# JSON Feed module

## Summary
A Views display plugin to provide a JSON Feed path and attachment for a View.

## Configuration
Once enabled, a JSON Feed display can be added to a View. It must have a path,
and can optionally be attached to another display (e.g. the View's Page).

Both the Format and Row plugins have configuration options, but there are only a
handful of requirements:

 - The View must have a title (or use the site's name as the title).
 - The Row style `id`, `url`, and either `content_html` or `content_text`
   attributes must have fields mapped.

Paging is supported, and if enabled the feed's `next_url` attribute will contain
a link tothe next page.

If the feed is attached to a page display, an alternate link tag pointing to the
feed will be added to the header of that page, and a link with icon will be
added to the page's feed icons.
