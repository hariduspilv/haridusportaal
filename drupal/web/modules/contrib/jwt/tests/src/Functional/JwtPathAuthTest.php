<?php

namespace Drupal\Tests\jwt\Functional;

use Drupal\file\Entity\File;
use Drupal\file\FileInterface;
use Drupal\jwt\JsonWebToken\JsonWebToken;
use Drupal\Tests\BrowserTestBase;
use Drupal\Core\Url;
use Drupal\Tests\file\Functional\FileFieldCreationTrait;
use Drupal\Tests\TestFileCreationTrait;

/**
 * Tests path-based authentication.
 *
 * @group jwt
 */
class JwtPathAuthTest extends BrowserTestBase {

  use FileFieldCreationTrait;
  use TestFileCreationTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'file',
    'rest',
    'key',
    'jwt',
    'jwt_path_auth',
    'jwt_auth_consumer',
    'jwt_test',
  ];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * A user with the 'administer jwt' permission.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $adminUser;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->adminUser = $this->drupalCreateUser(['administer jwt', 'access content']);
    // Enable a REST resource for file entities to verify that that path-based
    // auth can also be used to authenticate REST requests.
    $params = [
      'id' => 'entity.file',
      'plugin_id' => 'entity:file',
      'granularity' => 'resource',
      'configuration' => [
        'authentication' => [
          'cookie',
          'jwt_path_auth',
        ],
        'methods' => [
          'GET',
        ],
        'formats' => [
          'json',
        ],
      ],
    ];
    $storage = $this->container->get('entity_type.manager')->getStorage('rest_resource_config');
    $resource = $storage->create($params);
    $resource->save();
    $this->container->get('router.builder')->rebuild();
  }

  /**
   * Test admin form updates and actual path auth.
   */
  public function testPathAdmin() {
    $this->drupalLogin($this->adminUser);
    $url = Url::fromRoute('jwt_path_auth.config_form');
    $this->drupalGet($url);
    $edit = [
      'allowed_path_prefixes' => "/system/files/\nzzz",
    ];
    $this->drupalPostForm(NULL, $edit, 'Save configuration');
    $this->assertText('Paths must start with a slash.');
    $edit = [
      'allowed_path_prefixes' => "/system/files/\r\n/foo/zzz/ \r\n/entity/file/",
    ];
    $this->drupalPostForm(NULL, $edit, 'Save configuration');
    $config = $this->config('jwt_path_auth.config');
    $expected = ['/system/files/', '/foo/zzz/', '/entity/file/'];
    $this->assertSame($expected, $config->get('allowed_path_prefixes'));
    /** @var \Drupal\Core\File\FileSystemInterface $file_system */
    $file_system = $this->container->get('file_system');
    // A temporary private file can be access by the creator.
    // @see file_file_download().
    $file = $this->createPrivateFile('drupal.txt', $this->adminUser->id(), 0);
    // Make sure the logged-in user can access the file.
    $file_real_path = $file_system->realpath($file->getFileUri());
    $this->assertFileExists($file_real_path);
    $this->drupalGet($file->createFileUrl());
    $this->assertResponse(200);
    $this->assertText($this->getFileContent($file));
    // Make sure the logged-in user can access the REST resource. The path
    // should be '/entity/file/' . $file->id().
    $options = [
      'query' => [
        '_format' => 'json',
      ],
    ];
    $file_rest_url = Url::fromRoute('rest.entity.file.GET', ['file' => $file->id()], $options);
    $this->drupalGet($file_rest_url);
    $this->assertResponse(200);
    $this->drupalLogout();
    // Expect a 403 when not authenticated.
    $this->drupalGet($file->createFileUrl());
    $this->assertResponse(403);
    // When Drupal is in a subdirectory (such as drupal.org testbot) any
    // path in the JWT other than a "/" must bre prefixed with the base
    // path - the system does not expect the client to know where Drupal
    // is actually installed in terms of path hierarchy.
    $base_url = $this->container->get('router.request_context')->getBaseUrl();
    /** @var \Drupal\jwt\Transcoder\JwtTranscoderInterface $transcoder */
    $transcoder = $this->container->get('jwt.transcoder');
    $jwt = new JsonWebToken();
    $jwt->setClaim(['drupal', 'path_auth', 'uid'], $this->adminUser->id());
    $jwt->setClaim(['drupal', 'path_auth', 'path'], '/');
    $token = $transcoder->encode($jwt);
    $this->assertSame('private://drupal.txt', $file->getFileUri());
    $options = [
      'query' => [
        'jwt' => $token,
      ],
    ];
    // Make a real request with the token in the query string.
    $this->drupalGet($file->createFileUrl(), $options);
    $this->assertResponse(200);
    $this->assertText($this->getFileContent($file));
    // If the path claim on the JWT doesn't match, access should be denied.
    $jwt = new JsonWebToken();
    $jwt->setClaim(['drupal', 'path_auth', 'uid'], $this->adminUser->id());
    $jwt->setClaim(['drupal', 'path_auth', 'path'], $base_url . '/foo/');
    $token = $transcoder->encode($jwt);
    $options = [
      'query' => [
        'jwt' => $token,
      ],
    ];
    $this->drupalGet($file->createFileUrl(), $options);
    $this->assertResponse(403);
    // Making a REST api request with no JWT should be denied.
    $options = [
      'query' => [
        '_format' => 'json',
      ],
    ];
    $file_rest_url = Url::fromRoute('rest.entity.file.GET', ['file' => $file->id()], $options);
    $this->drupalGet($file_rest_url);
    $this->assertResponse(403);
    // Token path does not match, should still be 403.
    $options = [
      'query' => [
        '_format' => 'json',
        'jwt' => $token,
      ],
    ];
    $file_rest_url = Url::fromRoute('rest.entity.file.GET', ['file' => $file->id()], $options);
    $this->drupalGet($file_rest_url);
    $this->assertResponse(403);
    // Create a new token matching the request path prefix.
    $jwt = new JsonWebToken();
    $jwt->setClaim(['drupal', 'path_auth', 'uid'], $this->adminUser->id());
    $jwt->setClaim(['drupal', 'path_auth', 'path'], $base_url . '/entity/');
    $token = $transcoder->encode($jwt);
    $options = [
      'query' => [
        '_format' => 'json',
        'jwt' => $token,
      ],
    ];
    $file_rest_url = Url::fromRoute('rest.entity.file.GET', ['file' => $file->id()], $options);
    $this->drupalGet($file_rest_url);
    $this->assertResponse(200);
    $json = $this->getSession()->getPage()->getContent();
    $data = json_decode($json, TRUE);
    $this->assertEquals($file->uuid(), $data['uuid'][0]['value']);
    // If the user is blocked, the JWT should stop working.
    $this->adminUser->block();
    $this->adminUser->save();
    $this->drupalGet($file_rest_url);
    $this->assertResponse(403);
  }

  /**
   * Creates a private file.
   *
   * @param string $file_name
   *   The file name.
   * @param int $uid
   *   The file owning user ID.
   * @param int $status
   *   The file status.
   *
   * @return \Drupal\Core\Entity\EntityInterface|\Drupal\file\Entity\File
   *   The file entity.
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  protected function createPrivateFile($file_name, $uid = 1, $status = FILE_STATUS_PERMANENT) {
    // Create a new file entity.
    $file = File::create([
      'uid' => $uid,
      'filename' => $file_name,
      'uri' => "private://$file_name",
      'filemime' => 'text/plain',
      'status' => $status,
    ]);
    file_put_contents($file->getFileUri(), $this->getFileContent($file));
    $file->save();
    return $file;
  }

  /**
   * Gets the text secret for a file.
   *
   * @param \Drupal\file\FileInterface $file
   *   The file entity.
   *
   * @return string
   *   The text secret.
   */
  protected function getFileContent(FileInterface $file) {
    return "The content in {$file->label()} {$file->uuid()}";
  }

}
