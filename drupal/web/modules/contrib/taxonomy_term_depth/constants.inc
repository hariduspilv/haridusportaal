<?php
/**
 * @file
 * Constants file
 */

/*
 * Essential constant definitions
 */

/**
 * Absolute path to module
 */
define('TAXONOMY_TERM_DEPTH_ROOT', __DIR__); // Module root

/**
 * Relevant path to current module
 */
define('TAXONOMY_TERM_DEPTH_ROOT_REL', str_replace(DRUPAL_ROOT. DIRECTORY_SEPARATOR, NULL, TAXONOMY_TERM_DEPTH_ROOT));

/**
 * Field used for storing taxonomy level value
 */
define('TAXONOMY_TERM_DEPTH_CACHE_PROPERTY', 'depth_level');
