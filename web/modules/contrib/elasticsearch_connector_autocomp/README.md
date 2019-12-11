#Elasticsearch Connector Autocomplete

This module adds the ability to configure the elasticsearch index and fields to index ngrams, which improves autocompletion results for search_api, elasticsearch_connector and search_api_autocomplete module.

When configuring autocomplete with search_api module and the elasticsearch_connector module, auto completion is a little clunky.

Autocomplete works out of the box, but since words are indexed essentially as whole words, autocomplete retrieves no results until an entire word has been entered first. This is also the case for search, entire words need to be entered, not just parts of words.

This module adds a simple ngram analyzer to the elasticsearch index with configuration min gram and max gram values.
And it also supplies a Fulltext (ngram) data type that can be applied to fields when the indexe's ngram analyzer is enabled.

To learn more about ngrams and analyzers in elasticsearch, read here: https://qbox.io/blog/an-introduction-to-ngrams-in-elasticsearch
