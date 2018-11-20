<?php

function htm_custom_feedback_views_data(){
	$data = [];

	$data['htm_custom_feedback_score'] = [
		'table' => [
			'group' =>  t('Admin feedback score group'),
			'base' => [
				'field' => 'id',
				'title' => t('Admin feedback score'),
				'help' => ''
			],
			'provider' => 'htm_custom_feedback'
		]
	];

	$data['htm_custom_feedback_score']['id'] = [
		'title' => t('ID'),
		'help' => t('ID'),
		'field' => [
			'id' => 'numeric',
		],
		'filter' => [
			'id' => 'numeric',
		],
		'sort' => [
			'id' => 'standard',
		],
		'argument' => [
			'id' => 'numeric',
		],
	];

	$data['htm_custom_feedback_score']['nid'] = [
		'title' => t('Nodes id'),
		'help' => t('Nodes id'),
		'field' => [
			'id' => 'numeric',
		],
		'filter' => [
			'id' => 'numeric',
		],
		'sort' => [
			'id' => 'standard',
		],
		'argument' => [
			'id' => 'numeric',
		],
	];

	$data['htm_custom_feedback_score']['yes_count'] = [
		'title' => t('Nodes positives feedbacks count'),
		'help' => t('Nodes positives feedbacks count'),
		'field' => [
			'id' => 'numeric',
		],
		'filter' => [
			'id' => 'numeric',
		],
		'sort' => [
			'id' => 'standard',
		],
		'argument' => [
			'id' => 'numeric',
		],
	];

	$data['htm_custom_feedback_score']['no_count'] = [
		'title' => t('Nodes negative feedbacks count'),
		'help' => t('Nodes negative feedbacks count'),
		'field' => [
			'id' => 'numeric',
		],
		'filter' => [
			'id' => 'numeric',
		],
		'sort' => [
			'id' => 'standard',
		],
		'argument' => [
			'id' => 'numeric',
		],
	];

	$data['htm_custom_feedback_score']['count'] = [
		'title' => t('Total count of feedbacks'),
		'help' => t('Total count of feedbacks'),
		'field' => [
			'id' => 'numeric',
		],
		'filter' => [
			'id' => 'numeric',
		],
		'sort' => [
			'id' => 'standard',
		],
		'argument' => [
			'id' => 'numeric',
		],
	];

	$data['htm_custom_feedback_score']['total_score'] = [
		'title' => t('Nodes total score'),
		'help' => t('Nodes total score'),
		'field' => [
			'id' => 'numeric',
		],
		'filter' => [
			'id' => 'numeric',
		],
		'sort' => [
			'id' => 'standard',
		],
		'argument' => [
			'id' => 'numeric',
		],
	];

	$data['htm_custom_feedback_score']['nid'] = [
		'title' => t('node field data table'),
		'help' => t('Nodes table'),
		'relationship' => [
			'base' => 'node_field_data',
			'base field' => 'nid',
			'id' => 'standard',
			'label' => t('admin feedback score'),
		],
	];

	$data['htm_custom_feedback_score']['feedback_nid'] = [
		'title' => t('admin feedback'),
		'help' => t('admin feedback'),
		'relationship' => [
			'base' => 'htm_custom_feedback',
			'base field' => 'nid',
			'id' => 'standard',
			'field' => 'nid',
			'label' => t('admin feedback'),
		],
	];

	$data['htm_custom_feedback'] = [
		'table' => [
			'group' =>  t('Admin feedback'),
		]
	];

	$data['htm_custom_feedback']['id'] = [
		'title' => t('ID'),
		'help' => t('ID'),
		'field' => [
			'id' => 'numeric',
		],
		'filter' => [
			'id' => 'numeric',
		],
		'sort' => [
			'id' => 'standard',
		],
		'argument' => [
			'id' => 'numeric',
		],
	];

	$data['htm_custom_feedback']['nid'] = [
		'title' => t('nid'),
		'help' => t('nid'),
		'field' => [
			'id' => 'numeric',
		],
		'filter' => [
			'id' => 'numeric',
		],
		'sort' => [
			'id' => 'standard',
		],
		'argument' => [
			'id' => 'numeric',
		],
	];

	$data['htm_custom_feedback']['feedback_type'] = [
		'title' => t('feedback_type'),
		'help' => t('feedback_type'),
		'field' => [
			'id' => 'numeric',
		],
		'filter' => [
			'id' => 'numeric',
		],
		'sort' => [
			'id' => 'standard',
		],
		'argument' => [
			'id' => 'numeric',
		],
	];

	$data['htm_custom_feedback']['feedback_message'] = [
		'title' => t('Feedback message'),
		'help' => t('Feedback message.'),
		'field' => [
			'id' => 'standard',
		],
		'sort' => [
			'id' => 'standard',
		],
		'filter' => [
			'id' => 'string',
		],
		'argument' => [
			'id' => 'string',
		],
	];

	$data['htm_custom_feedback']['created'] = [
		'title' => t('Created'),
		'help' => t('Creation date in unix timestamp'),
		'field' => [
			'id' => 'date',
		],
		'sort' => [
			'id' => 'date',
		],
		'filter' => [
			'id' => 'date',
		],
		'argument' => [
			'id' => 'date',
		],
	];

	return $data;
}