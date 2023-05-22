<?php

namespace Drupal\htm_custom_rest\Plugin\rest\resource;


use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\Core\Entity\EntityDisplayRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Fields\ElasticQuery\ElasticQuery;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Drupal\file\Entity\File;
use Drupal\image\Entity\ImageStyle;

use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;


/**
 * Represents Product list rest records as resources.
 *
 * @RestResource (
 *   id = "htm_custom_rest_list_view",
 *   label = @Translation("HTM Entity list rest"),
 *   uri_paths = {
 *     "canonical" = "/api/list",
 *   }
 * )
 *
 * @DCG
 * This plugin exposes database records as REST resources. In order to enable it
 * import the resource configuration into active configuration storage. You may
 * find an example of such configuration in the following file:
 * core/modules/rest/config/optional/rest.resource.entity.node.yml.
 * Alternatively you can make use of REST UI module.
 * @see https://www.drupal.org/project/restui
 * For accessing Drupal entities through REST interface use
 * \Drupal\rest\Plugin\rest\resource\EntityResource plugin.
 */
class ListResource extends ResourceBase {


  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;
  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  private $entityDisplayRepository;
  private EntityTypeManagerInterface $entityTypeManager;
  private $entityTypemanager;

  /**
   * Constructs a new BaseSettingsRestResource object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Entity type manager.
   * @param \Drupal\Core\Database\Connection $database
   *   Database connection.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
    LanguageManagerInterface $languageManager,
    EntityTypeManagerInterface $entityTypeManager,
    Connection $database,
    EntityDisplayRepositoryInterface $entityDisplayRepository
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->currentUser = $current_user;
    $this->languageManager = $languageManager;
    $this->entityTypeManager = $entityTypeManager;
    $this->db = $database;
    $this->entityDisplayRepository = $entityDisplayRepository;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('graphql_custom_translation'),
      $container->get('current_user'),
      $container->get('language_manager'),
      $container->get('entity_type.manager'),
      $container->get('database'),
      $container->get('entity_display.repository')

    );
  }
  /**
   * Responds to GET requests.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return ResourceResponse
   *   The response containing the record.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   */
  public function get(Request $request) {
    // Set default range if not provided.
    $params = $request->query->all();
    $params['limit'] = $params['limit'] ?? 24;
    $count = 0;
    // Get entities and count.
    if (isset($params['content_type'])) {
      if ($params['content_type'] == 'school') {
        $el_service = \Drupal::service('htm_custom_rest.elastic_service');
        $params['elasticsearch_index'] = ['elasticsearch_index_drupaldb_schools'];
        $params['sortField'] = 'field_school_name';
        $params['sortDirection'] = 'ASC';
        $el_list = $el_service->elasticSearch($params);
        $entities = $this->convertElastic($el_list);
        if (isset($el_list['count']['value'])) {
          $count = $el_list['count']['value'];
        }
      }
      elseif ($params['content_type'] == 'study_programme') {
        $el_service = \Drupal::service('htm_custom_rest.elastic_service');
        $params['elasticsearch_index'] = ['elasticsearch_index_drupaldb_study_programmes'];
        if (!isset($params['sortField'])) {
          $params['sortField'] = 'title';
        }
        if (!isset($params['sortDirection'])) {
          $params['sortDirection'] = 'ASC';
        }
        $params['status'] = 1;
        $el_list = $el_service->elasticSearchStudyProgramme($params);
        $entities = $this->convertElastic($el_list);
        if (isset($el_list['count']['value'])) {
          $count = $el_list['count']['value'];
        }
      }
      elseif ($params['content_type'] == 'search') {
        $el_service = \Drupal::service('htm_custom_rest.elastic_service');

        if (!empty($params['search_term'])) {
//          $params['title'] = $params['search_term'];
        }
        $params['status'] = 1;
        $el_list = $el_service->elasticPageSearch($params);
        $entities = $this->convertElastic($el_list);
        if (isset($el_list['count']['value'])) {
          $count = $el_list['count']['value'];
        }
      }
      elseif ($params['content_type'] == 'similar_programmes') {
        $el_service = \Drupal::service('htm_custom_rest.similarProgramme');

        $params['status'] = 1;
        $el_list = $el_service->similarSearch($params);
        $entities = $this->convertElastic($el_list);
        if (isset($el_list['count']['value'])) {
          $count = $el_list['count']['value'];
        }
      }
      else{
        $entities = $this->queryEntities($params, FALSE);
        if ($params['content_type'] == 'oska_field_page') {
          $entities = $this->getSubEntities($entities);
        }
        if ($params['content_type'] == 'oska_main_profession_page') {
          $entities = $this->getOskaMainSubEntities($entities);
        }
        $count = $this->queryEntities($params, TRUE);
      }
    }
    // Get fields for the view mode and filter the field values.
    $fields = $this->getViewModeFields('node', $params['content_type'], 'list');
    if ($params['content_type'] != 'search') {
      $returnable_values = $this->filterFieldsAndReturnValues($entities, $fields, 'list');
    }
    else{
      $fields = $this->getViewModeFields('node', $params['content_type'], 'search');

      $returnable_values = $this->filterFieldsAndReturnValues($entities, $fields, 'search');
    }

    $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
    $data = [
      'entities' => $returnable_values,
      'count' => $count,
    ];
    $cachable_response = new CacheableResponse(json_encode($data));
    $cachable_response->addCacheableDependency($params['content_type']);
//    $cachable_response = new ResourceResponse($returnable_values);
    return $cachable_response;
  }

  private function getOskaMainSubEntities($entities) {
    $storage = $this->entityTypeManager->getStorage('oska_indicator_entity');
    $storage2 = $this->entityTypeManager->getStorage('oska_filling_bar_entity');

    foreach ($entities as &$entity) {
      $entity_query = $storage->getQuery();
      $entity_query->condition('oska_main_profession.target_id',$entity->Id());
      $sub_entities = $entity_query->execute();
      if (!empty($sub_entities)) {
        $entity->subOska = $storage->loadMultiple($sub_entities);
      }
      $entity_query2 = $storage2->getQuery();
      $entity_query2->condition('oska_main_profession.target_id',$entity->id());
      $sub_entities2 = $entity_query2->execute();
      if (!empty($sub_entities2)) {
        $entity->subOska2 = $storage2->loadMultiple($sub_entities2);
      }
    }
    return  $entities;
  }
  private function getSubEntities($entities) {
    $db = $this->db;
    foreach ($entities as &$entity) {
      $nid = $entity->id();
      $query = $db->select('node','n');
      $query->fields('n',['nid']);
      $query->condition('n.langcode',$entity->language()->getId());
      $query->condition('n.type','oska_main_profession_page');
      $query->join('node__field_sidebar','nfs','n.nid=nfs.entity_id');
      $query->join('paragraph__field_oska_field','nfof','nfs.field_sidebar_target_id=nfof.entity_id');
      $query->condition('nfof.field_oska_field_target_id',$nid);

      $nids = $query->execute()->fetchCol();
      if (!empty($nids)) {
        $subnids = $this->entityTypeManager->getStorage('node')->loadMultiple($nids);
        $entity->subnids = $subnids;
      }
    }
    return $entities;
  }
  /**
   * This function converts an array of Elasticsearch results to an array of node ids.
   * @param $el_list array The Elasticsearch results.
   * @return array The array of node ids.
   */
  private function convertElastic($el_list) {
    $nids = [];
    // Loop through each value in the Elasticsearch results.
    foreach ($el_list['values'] as $value) {
      // Check if the '_source' field exists before accessing the 'nid' property.
      if (isset($value['_source']['nid'])) {
        $nid = $value['_source']['nid'][0];
        $nids[$nid] = $nid;
      }
    }
    return $this->entityTypeManager->getStorage('node')->loadMultiple($nids);
  }
  private function queryEntities($filters, $count) {
    $db = $this->db;
    $base_query = $db->select('node', 'n');
    $base_query->fields('n', ['nid']);
    if (isset($filters['content_type'])) {
      if ($filters['content_type'] == 'study_comparison'){
        $base_query->condition('n.type', 'study_programme');
      }
      elseif ($filters['content_type'] == 'related_study_programme'){
        $base_query->condition('n.type', 'study_programme');
      }
      elseif ($filters['content_type'] == 'similar_programmes'){
        $base_query->condition('n.type', 'study_programme');
      }
      else {
        $base_query->condition('n.type', $filters['content_type']);
      }
      switch ($filters['content_type']) {
        case 'studypage':

          if (!empty($filters)) {
            $subquery = $this->buildStudyPageSubquery($db, $filters);
            $base_query->condition('n.nid', $subquery, 'IN');
          }
          break;
        case 'event':
        if (!empty($filters)) {
          $subquery = $this->buildEventPageSubquery($db, $filters);
          $base_query->condition('n.nid', $subquery, 'IN');
        }
          break;
        case 'article':
        if (!empty($filters)) {
          $subquery = $this->buildArticlePageSubquery($db, $filters);
          $base_query->condition('n.nid', $subquery, 'IN');
        }
          break;
        case 'oska_main_profession_page':
        if (!empty($filters)) {
          $subquery = $this->buildOskaProfessionQuery($db, $filters);
          $base_query->condition('n.nid', $subquery, 'IN');
        }
          break;
        case 'news':
        if (!empty($filters)) {
          $subquery = $this->buildNewsPageSubquery($db, $filters);
          $base_query->condition('n.nid', $subquery, 'IN');
        }
          break;
        case 'study_comparison' : {
          $subquery = $this->buildStudyComparisonQuery($db,$filters);
          $base_query ->condition('n.nid',$subquery, 'IN');
        }
        break;
        case 'related_study_programme' : {
//          $subquery = $this->buildRelatedStudyComparisonQuery($db,$filters);
          if (!empty($filters['schoolId'])){
            $base_query->join('node__field_educational_institution','nfei','n.nid = nfei.entity_id');
            $base_query->condition('nfei.field_educational_institution_target_id',[$filters['schoolId']],'IN');
          }
//          $base_query ->condition('n.nid',$subquery, 'IN');
        }
        break;
      }
      $base_query->join('node_field_data', 'nfd', 'n.nid = nfd.nid');
      $base_query->condition('nfd.status', 1);
      if (isset($filters['lang'])) {
        $base_query->condition('nfd.langcode',strtolower($filters['lang']));
      }
      $base_query->orderBy('nfd.created', 'DESC');

      if ($count) {
        $count_query = $base_query->countQuery();
        return $count_query->execute()->fetchField();
      }

      $offset = intval(isset($filters['offset']) ? $filters['offset'] : 0);
      $limit = intval( isset($filters['limit']) ? $filters['limit'] : 16);
      if ($offset == 0) {
        $limit += 1;
      }
      $base_query->range($offset, $limit);
      $nids = $base_query->execute()->fetchCol();
      return $this->entityTypeManager->getStorage('node')->loadMultiple($nids);
    }
  }
  private function buildStudyPageSubquery($db, $filters) {
    $subquery = $db->select('node', 'n');
    $subquery->fields('n', ['nid']);

    $join_clauses = [];
    $condition_clauses = [];

    if (!empty($filters['titleValue'])) {
      $join_clauses[] = [
        'node_field_data' => ['nfd', 'n.nid=nfd.nid'],
        'node__field_content' => ['nfc', 'n.nid=nfc.entity_id'],
        'node__field_introduction' => ['nfi', 'n.nid=nfi.entity_id'],
        'node__field_accordion' => ['nfa', 'n.nid=nfa.entity_id'],
        'paragraph__field_study_accordion_intro' => ['pfsai', 'nfa.field_accordion_target_id=pfsai.entity_id'],
        'paragraph__field_study_accordion_content' => ['pfsac', 'nfa.field_accordion_target_id=pfsac.entity_id'],
        'paragraph__field_body' => ['pfb', 'nfa.field_accordion_target_id=pfb.entity_id'],
        'node__field_right_column' => ['nfrc', 'n.nid=nfrc.entity_id'],
        'paragraph__field_study' => ['pfs', 'nfrc.field_right_column_target_id=pfs.entity_id'],
        'paragraph__field_publisher' => ['pfp', 'pfs.field_study_target_id=pfp.entity_id'],
        'paragraph__field_author' => ['pfa', 'pfs.field_study_target_id=pfa.entity_id']
      ];

      $condition_clauses[] = [
        'or' => [
          ['nfd.title', $filters['titleValue'], 'LIKE'],
          ['nfc.field_content_value', $filters['titleValue'], 'LIKE'],
          ['nfi.field_introduction_value', $filters['titleValue'], 'LIKE'],
          ['pfsai.field_study_accordion_intro_value', $filters['titleValue'], 'LIKE'],
          ['pfsac.field_study_accordion_content_value', $filters['titleValue'], 'LIKE'],
          ['pfb.field_body_value', $filters['titleValue'], 'LIKE'],
          ['pfp.field_publisher_value', $filters['titleValue'], 'LIKE'],
          ['pfa.field_author_value', $filters['titleValue'], 'LIKE']
        ]
      ];
    }

    if (!empty($filters['studyLabelValue'])) {
      $join_clauses[] = ['node__field_label' => ['nfsl', 'n.nid=nfsl.entity_id']];
      $condition_clauses[] = [
        'or' => [
          [
            'nfsl.field_label_target_id', explode(';', $filters['studyLabelValue']), 'IN']
        ]
      ];
    }

    if (!empty($filters['studyTopicValue'])) {
      $join_clauses[] = ['node__field_study_topic' => ['nfst', 'n.nid=nfst.entity_id']];
      $condition_clauses[] = ['or' => [['nfst.field_study_topic_target_id', explode(';', $filters['studyTopicValue']), 'IN']]];
    }

    if (!empty($filters['publicationTypeValue'])) {
      $join_clauses[] = [
        'node__field_right_column' => ['nfrc', 'n.nid=nfrc.entity_id'],
        'paragraph__field_study' => ['pfs', 'nfrc.field_right_column_target_id=pfs.entity_id'],
        'paragraph__field_publication_type' => ['pfpt', 'pfs.field_study_target_id=pfpt.entity_id']
      ];

      $publication_types = explode(';', $filters['publicationTypeValue']);
      $condition_clauses[] = ['or' => [['pfpt.field_publication_type_target_id', $publication_types, 'IN']]];
    }
    if (!empty($filters['publicationLanguageValue'])) {
      $join_clauses[] = [
        'node__field_right_column' => ['nfrc', 'n.nid=nfrc.entity_id'],
        'paragraph__field_study' => ['pfs', 'nfrc.field_right_column_target_id=pfs.entity_id'],
        'paragraph__field_publication_lang' => ['pfpl', 'pfs.field_study_target_id=pfpl.entity_id']
      ];

      $publication_langs = explode(';', $filters['publicationLanguageValue']);
      $condition_clauses[] = ['or' => [['pfpl.field_publication_lang_target_id', $publication_langs, 'IN']]];
    }

    if (!empty($filters['dateFrom'])) {
      $join_clauses[] = [
        'node__field_right_column' => ['nfrc', 'n.nid=nfrc.entity_id'],
        'paragraph__field_study' => ['pfs', 'nfrc.field_right_column_target_id=pfs.entity_id'],
        'paragraph__field_year' => ['pfy', 'pfs.field_study_target_id=pfy.entity_id']
      ];

      $condition_clauses[] = ['pfy.field_year_value', intval($filters['dateFrom']), '>='];
    }

    if (!empty($filters['dateTo'])) {
      $join_clauses[] = [
        'node__field_right_column' => ['nfrc', 'n.nid=nfrc.entity_id'],
        'paragraph__field_study' => ['pfs', 'nfrc.field_right_column_target_id=pfs.entity_id'],
        'paragraph__field_year' => ['pfy', 'pfs.field_study_target_id=pfy.entity_id']
      ];

      $condition_clauses[] = ['pfy.field_year_value', intval($filters['dateTo']), '<='];
    }
    return $this->createSubQuery($condition_clauses,$join_clauses,$db);
  }
  private function buildEventPageSubquery($db, $filters) {
    $subquery = $db->select('node', 'n');
    $subquery->fields('n', ['nid']);

    $join_clauses = [];
    $condition_clauses = [];



    if (!empty($filters['tags'])) {
      $join_clauses[] = ['node__field_tag' => ['nft', 'n.nid=nft.entity_id']];
      $condition_clauses[] = [
        'or' => [
          [
            'nft.field_tag_target_id', explode(';', $filters['tags']), 'IN']
        ]
      ];
    }
    if (!empty($filters['title'])) {
      $join_clauses[] = ['node_field_data' => ['nfd', 'n.nid=nfd.nid']];
      $condition_clauses[] = ['nfd.title', '%'.$filters['title'].'%', 'LIKE'];
    }

    if (!empty($filters['studyTopicValue'])) {
      $join_clauses[] = ['node__field_study_topic' => ['nfst', 'n.nid=nfst.entity_id']];
      $condition_clauses[] = ['or' => [['nfst.field_study_topic_target_id', explode(';', $filters['studyTopicValue']), 'IN']]];
    }

    if (!empty($filters['publicationTypeValue'])) {
      $join_clauses[] = [
        'node__field_right_column' => ['nfrc', 'n.nid=nfrc.entity_id'],
        'paragraph__field_study' => ['pfs', 'nfrc.field_right_column_target_id=pfs.entity_id'],
        'paragraph__field_publication_type' => ['pfpt', 'pfs.field_study_target_id=pfpt.entity_id']
      ];

      $publication_types = explode(';', $filters['publicationTypeValue']);
      $condition_clauses[] = ['or' => [['pfpt.field_publication_type_target_id', $publication_types, 'IN']]];
    }
    if (!empty($filters['publicationLanguageValue'])) {
      $join_clauses[] = [
        'node__field_right_column' => ['nfrc', 'n.nid=nfrc.entity_id'],
        'paragraph__field_study' => ['pfs', 'nfrc.field_right_column_target_id=pfs.entity_id'],
        'paragraph__field_publication_lang' => ['pfpl', 'pfs.field_study_target_id=pfpl.entity_id']
      ];

      $publication_langs = explode(';', $filters['publicationLanguageValue']);
      $condition_clauses[] = ['or' => [['pfpl.field_publication_lang_target_id', $publication_langs, 'IN']]];
    }

    if (!empty($filters['dateFrom'])) {
      $join_clauses[] = [
        'node__field_event_main_date' => ['nfemd', 'n.nid=nfemd.entity_id'],
      ];

      $condition_clauses[] = ['nfemd.field_event_main_date_value',$filters['dateFrom'], '>='];
    }

    if (!empty($filters['types'])) {
      $join_clauses[] = [
        'node__field_event_type' => ['nfet', 'n.nid=nfet.entity_id'],
      ];
      $condition_clauses[] = ['or' => [['nfet.field_event_type_target_id', explode(';', $filters['types']), 'IN']]];
    }
    if (!empty($filters['timeFrom'])) {
      $join_clauses[] = [
        'node__field_event_start_time_main' => ['nfestm', 'n.nid=nfestm.entity_id'],
      ];

      $condition_clauses[] = ['nfestm.field_event_start_time_main_value', intval($filters['timeFrom']), '>='];
    }

    if (!empty($filters['dateTo'])) {
      $join_clauses[] = [
        'node__field_event_main_date' => ['nfemd', 'n.nid=nfemd.entity_id'],
      ];

      $condition_clauses[] = ['nfemd.field_event_main_date_value', $filters['dateTo'], '<='];
    }
    if (!empty($filters['timeTo'])) {
      $join_clauses[] = [
        'node__field_event_end_time_main' => ['nfeetm', 'n.nid=nfeetm.entity_id'],
      ];

      $condition_clauses[] = ['nfeetm.field_event_end_time_main_value', intval($filters['dateTo']), '<='];
    }
    return $this->createSubQuery($condition_clauses,$join_clauses,$db);
  }
  private function buildArticlePageSubquery($db, $filters) {
    $subquery = $db->select('node', 'n');
    $subquery->fields('n', ['nid']);

    $join_clauses = [];
    $condition_clauses = [];



    if (!empty($filters['title'])) {
      $join_clauses[] = ['node_field_data' => ['nfd', 'n.nid=nfd.nid']];
      $condition_clauses[] = ['nfd.title', '%'.$filters['title'].'%', 'LIKE'];
    }
    if (!empty($filters['tag'])) {
      $join_clauses[] = ['node__field_tag' => ['nft', 'n.nid=nft.entity_id']];
      $condition_clauses[] = [
        'or' => [
          [
            'nft.field_tag_target_id', explode(';', $filters['tag'])]
        ]
      ];
    }

    if (!empty($filters['minDate'])) {
      $join_clauses[] = [
        'node_field_data' => ['nfd', 'n.nid=nfd.nid'],
      ];

      $condition_clauses[] = ['nfd.created', $filters['minDate'], '>='];
    }


    if (!empty($filters['maxDate'])) {
      $join_clauses[] = [
        'node_field_data' => ['nfd', 'n.nid=nfd.nid'],
      ];

      $condition_clauses[] = ['nfd.created', $filters['maxDate'], '<='];
    }


    return $this->createSubQuery($condition_clauses,$join_clauses,$db);
  }
  private function buildNewsPageSubquery($db, $filters) {
    $subquery = $db->select('node', 'n');
    $subquery->fields('n', ['nid']);

    $join_clauses = [];
    $condition_clauses = [];

    if (!empty($filters['title'])) {
      $join_clauses[] = ['node_field_data' => ['nfd', 'n.nid=nfd.nid']];
      $condition_clauses[] = ['nfd.title', '%'.$filters['title'].'%', 'LIKE'];
    }
    if (!empty($filters['tag'])) {
      $join_clauses[] = ['node__field_tag' => ['nft', 'n.nid=nft.entity_id']];
      $condition_clauses[] = [
        'or' => [
          [
            'nft.field_tag_target_id', explode(';', $filters['tag'])]
        ]
      ];
    }

    if (!empty($filters['minDate'])) {
      $join_clauses[] = [
        'node_field_data' => ['nfd', 'n.nid=nfd.nid'],
      ];
      $condition_clauses[] = ['nfd.created', $filters['minDate'], '>='];
    }


    if (!empty($filters['maxDate'])) {
      $join_clauses[] = [
        'node_field_data' => ['nfd', 'n.nid=nfd.nid'],
      ];

      $condition_clauses[] = ['nfd.created', $filters['maxDate'], '<='];
    }


    return $this->createSubQuery($condition_clauses,$join_clauses,$db);
  }
  private function buildStudyComparisonQuery($db, $filters) {
    $subquery = $db->select('node', 'n');
    $subquery->fields('n', ['nid']);

    $join_clauses = [];
    $condition_clauses = [];
    if (!empty($filters['nidValues'])) {
      $nidValues = $filters['nidValues'];
      $nidValues = str_replace('[','',$nidValues);
      $nidValues = str_replace('"','',$nidValues);
      $nidValues = str_replace(']','',$nidValues);
      $nids = explode(',', $nidValues);
      $or_clauses = [];
//      foreach ($nids as $nid) {
        $condition_clauses[] = [
          'or' =>[
            ['n.nid',$nids,'=']
          ]
        ];
//      }
    }

    return $this->createSubQuery($condition_clauses,$join_clauses,$db);
  }
  private function buildRelatedStudyComparisonQuery($db, $filters) {
    $subquery = $db->select('node', 'n');
    $subquery->fields('n', ['nid']);
    $join_clauses = [];
    $condition_clauses = [];
    $join_clauses[] = [
      'node__field_educational_institution',['nfei','n.nid=nfei.entity_id']
    ];
    $condition_clauses = [];
    if (!empty($filters['schoolId'])) {
      $condition_clauses[] = ['nfei.field_educational_institution_target_id', [$filters['schoolId']], '='];
    }
    return $this->createSubQuery($condition_clauses,$join_clauses,$db);
  }
  private function buildOskaProfessionQuery($db, $filters) {
    $subquery = $db->select('node', 'n');
    $subquery->fields('n', ['nid']);

    $join_clauses = [];
    $condition_clauses = [];



    if (!empty($filters['title'])) {
      $join_clauses[] = [
        'node_field_data' => ['nfd', 'n.nid=nfd.nid'],
        'node__field_sidebar' => ['nfs', 'n.nid=nfs.entity_id'],
        'paragraph__field_jobs' => ['pfj', 'nfs.field_sidebar_target_id=pfj.entity_id','LEFT'],
        'paragraph__field_job_name' => ['pfjn', 'pfj.field_jobs_target_id=pfjn.entity_id','LEFT'],
      ];
      $condition_clauses[] = [
        'or' => [
          ['nfd.title', '%'.$filters['title'].'%', 'LIKE'],
//          ['pfjn.field_job_name_value', '%'.$filters['title'].'%', 'LIKE'],
        ]
      ];
    }
    if (!empty($filters['oskaFieldValue'])) {
      $join_clauses[] = ['node__field_sidebar' => ['nfs', 'n.nid=nfs.entity_id']];
      $join_clauses[] = ['paragraph__field_oska_field' => ['pfof', 'nfs.field_sidebar_target_id=pfof.entity_id']];
      $condition_clauses[] = [
        'or' => [
          [
            'pfof.field_oska_field_target_id', explode(';', $filters['oskaFieldValue'])]
        ]
      ];
    }
    if (!empty($filters['fillingBar'])) {
      $join_clauses[] = ['node__field_filling_bar' => ['nffb', 'n.nid=nffb.entity_id']];
      $condition_clauses[] = [
        'or' => [
          [
            'nffb.field_filling_bar_value', explode(';', $filters['fillingBar'])]
        ]
      ];
    }



    return $this->createSubQuery($condition_clauses,$join_clauses,$db);
  }
  private function createSubQuery($condition_clauses, $join_clauses, $db) {
    $subquery = $db->select('node', 'n');
    $subquery->fields('n', ['nid']);

    $aliases = [];
    foreach ($join_clauses as $join_clause) {
      foreach ($join_clause as $table => $join) {
        if (!in_array($table, $aliases)) {
          [$alias, $condition,$join_type] = $join;
          if ($join_type == 'LEFT'){
            $subquery->leftJoin($table,$alias,$condition);
          }
          else {
            $subquery->join($table, $alias, $condition);
          }
        }
        $aliases[] = $table;
      }
    }
    foreach ($condition_clauses as $condition_clause) {
      if (is_array($condition_clause) && isset($condition_clause['or'])) {
        $or_group = $subquery->orConditionGroup();
        foreach ($condition_clause['or'] as $or_grouping) {
          [$column, $value, $operator] = $or_grouping;
          if (is_array($value)) {
            foreach ($value as $val) {
              $or_group->condition($column, $val, $operator);
            }
          }
          else{
            $or_group->condition($column, $value, $operator);
          }
        }
        $subquery->condition($or_group);
      } else {
        [$column, $value, $operator] = $condition_clause;
        $subquery->condition($column, $value, $operator);
      }
    }
    return $subquery;

  }


  /**
   * Get fields for a specific view mode.
   *
   * @param string $entity_type
   *   The entity type machine name.
   * @param string $bundle
   *   The bundle name for entity.
   * @param string $view_mode
   *   The view mode machine name.
   *
   * @return array
   *   An array of fields for the specified view mode.
   */
  private function getViewModeFields(string $entity_type, string $bundle, string $view_mode) {
    // Use dependency injection for the entity display repository.
    if ($bundle == 'study_comparison') {
      $bundle = 'study_programme';
    }
    if ($bundle == 'related_study_programme') {
      $bundle = 'study_programme';
    }
    if ($bundle == 'similar_programmes') {
      $bundle = 'study_programme';
    }
    $entityDisplayRepository = $this->entityDisplayRepository;

    // Load the entity display for the specified content type and view mode.
    $entityDisplay = $entityDisplayRepository->getViewDisplay($entity_type, $bundle, $view_mode);
    $fields = $entityDisplay->getComponents();

    if (empty($fields)) {
      throw new \RuntimeException('No fields defined in drupal admin for the specified view mode.');
    }

    return $fields;
  }


  /**
   * Filters and returns values of the given fields for the given entities.
   *
   * @param array $entities
   *   An array of entity objects.
   * @param array $fields
   *   An associative array of fields with field names as keys.
   * @param string $view_mode
   *   The view mode for rendering the entities.
   * @param bool $field_mode
   *   TRUE if field mode is enabled, FALSE otherwise.
   *
   * @return array
   *   An array of filtered field values for the given entities.
   */
  public function filterFieldsAndReturnValues($entities, $fields, $view_mode, $field_mode = FALSE) {
    $values = [];

    // Return an empty array if no entities or fields are provided.
    if (empty($entities) || empty($fields)) {
      return $values;
    }

    // Iterate through each entity.
    foreach ($entities as $entity) {
      $id = $entity->id();
      $entity_type_id = $entity->getEntityTypeId();

      // If not in field mode, set default values for nodes.
      if (!$field_mode) {
        $values[$id] = [];

        if ($entity_type_id == 'node') {
          $values[$id]['nid'] = $entity->id();
          $values[$id]['path'] = $entity->toLink()->getUrl()->toString(TRUE)->getGeneratedUrl();
        }
        if (isset($entity->subnids)){
          $values[$id]['subentities'] = $this->filterFieldsAndReturnValues($entity->subnids,$fields,$view_mode);
        }
        if (isset($entity->subOska)){
          $values[$id]['reverseOskaMainProfessionOskaIndicatorEntity'] = [];
          foreach ($entity->subOska as $oska) {
            $oska_out = [
              'icon' => $oska->get('icon')->value??null,
              'value' => $oska->get('value')->value??null,
              'oskaIndicator' => $oska->get('oska_indicator')->value??null,
              'oskaId' => $oska->get('oska_id')->value??null,

            ];
            $values[$id]['reverseOskaMainProfessionOskaIndicatorEntity'][] = $oska_out;
          }
        }
        if (isset($entity->subOska2)){
          $values[$id]['reverseOskaMainProfessionOskaFillingBarEntity'] = [];
          foreach ($entity->subOska2 as $oska2) {
            $oska_out = [
              'value' => $oska2->get('value')->value??null,
            ];
            $values[$id]['reverseOskaMainProfessionOskaFillingBarEntity'][] = $oska_out;
          }
        }
      }
      if ($view_mode == 'search' && !$field_mode){
        $fields = $this->getViewModeFields('node',$entity->bundle(),'search');
      }
      // Iterate through each field.
      foreach ($fields as $field_name => $field) {
        if (!$entity->hasField($field_name)){
          continue;
        }

        $field_value = '';
        $field_name_out = $this->camelize($field_name);
        // Process fields based on their type.
        switch ($field['type']) {
          case 'entity_reference_revisions_entity_view':
          case 'entity_reference_label':
            $field_value = $this->processReferenceFields($entity, $field_name, $view_mode);
            break;
          case 'image':
            // Load the image style.
            $image_style = ImageStyle::load('crop_small');

            // Get the file entities from the image field.
            $field_data = $entity->get($field_name)->referencedEntities();

            // Loop through the file entities.
            foreach ($field_data as $field_datum) {
              // Generate the styled image URL.
              $styled_image_url = $image_style->buildUrl($field_datum->getFileUri());

              // Create an array with the styled image URL.
              $field_value = [
                'url' => $styled_image_url,
              ];
            }

            // Get the alt and title attributes from the image field.
            $alt = $entity->get($field_name)->alt;
            $title = $entity->get($field_name)->title;

            // Add the alt and title attributes to the field value array if they exist.
            if (!empty($alt)) {
              $field_value['alt'] = $alt;
            }
            if (!empty($title)) {
              $field_value['title'] = $title;
            }
            break;
          case 'custom_video_formatter_type':
            $field_value = [];
            $videos = $entity->get($field_name)->getValue();
            $video_fields = [
              'input',
              'video_domain',
              'video_description',
              'video_id',
              'video_thumbnail',
            ];
            foreach ($videos as $video_key => $video) {
              foreach ($video_fields as $video_field) {
                $video_field_name = $this->camelize($video_field);
                // Check if the video field exists in the current video.
                if (isset($video[$video_field])) {
                  $field_value[$video_key][$video_field_name] = $video[$video_field];
                }
              }
            }
            break;
          case 'link':

            $field_link = $entity->get($field_name)->getValue();
            $field_value = $field_link;
            break;
          case 'string':
          case 'basic_string':
          case 'number_integer':
          case 'text_default':
          case 'boolean':
            $field_value = $entity->get($field_name)->getValue();
            if (count($field_value) == 1) {
              $field_value = reset($field_value);
              if(isset ($field_value['target_id'])) {
                $field_value = $field_value['target_id'];
              }
              elseif (isset ($field_value['value'])) {
                $field_value = $field_value['value'];
              }
            }
            else{
              $field_value = $this->convertToArray($field_value);
            }
            break;
          default:
            $field_value = $entity->get($field_name)->getValue();
            if (count($field_value) == 1) {
              $field_value = reset($field_value);
            if(isset ($field_value['target_id'])) {
              $field_value = $field_value['target_id'];
            }
            elseif (isset ($field_value['value'])) {
              $field_value = $field_value['value'];
            }
          }
            else{
              $field_value = $this->convertToArray($field_value);
            }
            break;
        }
        if ($view_mode == 'search' && !$field_mode){
          if (!empty($entity->bundle())){
            $values[$id]['content_type'] = $entity->bundle();
          }
        }
        // Assign field values to the output array.
        if (empty($field_value)) {
          $field_value = null;
        }
        if ($field_mode) {

          $values[$field_name_out] = $field_value;
        } else {
          $values[$id][$field_name_out] = $field_value;
        }
      }
    }

    return $values;
  }
  private function convertToArray($objects){
    $output = [];
    foreach ($objects as $object){
      if(isset($object['value'])){
        $output[] = $object['value'];
      }
      else{
        $output[] = reset($object);
      }
    }
    return $output;
  }
  /**
   * Processes and returns values for reference fields.
   *
   * @param object $entity
   *   The entity object.
   * @param string $field_name
   *   The name of the field to process.
   * @param string $view_mode
   *   The view mode for rendering the entities.
   *
   * @return array
   *   An array of processed field values.
   */
  private function processReferenceFields($entity, $field_name, $view_mode) {
    $field_value = [];
    $referenced_entities = $entity->get($field_name)->referencedEntities();
    $field_list = [];

    // Iterate through each referenced entity.
    foreach ($referenced_entities as $referenced_entity) {
      $referenced_entity_type = $referenced_entity->getEntityTypeId();
      $referenced_entity_id = $referenced_entity->id();

      // Process referenced entities based on their type.
      if ($referenced_entity_type === 'taxonomy_term') {
        // If the referenced entity is a taxonomy term, add its name to the field value.
        $field_value[$referenced_entity_id] = $referenced_entity->get('name')->value;
      } elseif ($referenced_entity_type === 'paragraph') {
        // If the referenced entity is a paragraph, process its fields and add them to the field value.
        $para_type = $referenced_entity->bundle();

        // Get field list only once for the first paragraph of the same type.
        if (empty($field_list[$para_type])) {
          $field_list[$para_type] = $this->getViewModeFields('paragraph', $para_type, $view_mode);
        }

        // Process paragraph fields and add them to the field value.
        $field_value[$referenced_entity_id] = $this->filterFieldsAndReturnValues([$referenced_entity], $field_list[$para_type], $view_mode, TRUE);
      }elseif ($referenced_entity_type === 'node') {
        // If the referenced entity is a paragraph, process its fields and add them to the field value.
        $para_type = $referenced_entity->bundle();

        // Get field list only once for the first paragraph of the same type.
        if (empty($field_list[$para_type])) {
          $field_list[$para_type] = $this->getViewModeFields('node', $para_type, $view_mode);
        }

        // Process paragraph fields and add them to the field value.
        $field_value[$referenced_entity_id] = $this->filterFieldsAndReturnValues([$referenced_entity], $field_list[$para_type], $view_mode, TRUE);
      }
    }

    return $field_value;
  }


  public function camelize($input, $separator = '_')
  {
    return lcfirst(str_replace($separator, '', ucwords($input, $separator)));
  }
}
