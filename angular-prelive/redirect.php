<?php

$url = 'http://test-htm.wiseman.ee:30000/';
echo file_get_contents($url.$_GET['q']);