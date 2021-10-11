<?php
/**
 * Elasticsearch PHP client
 *
 * @link      https://github.com/elastic/elasticsearch-php/
 * @copyright Copyright (c) Elasticsearch B.V (https://www.elastic.co)
 * @license   http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @license   https://www.gnu.org/licenses/lgpl-2.1.html GNU Lesser General Public License, Version 2.1 
 * 
 * Licensed to Elasticsearch B.V under one or more agreements.
 * Elasticsearch B.V licenses this file to you under the Apache 2.0 License or
 * the GNU Lesser General Public License, Version 2.1, at your option.
 * See the LICENSE file in the project root for more information.
 */
declare(strict_types = 1);

namespace Elasticsearch\Endpoints\Sql;

use Elasticsearch\Common\Exceptions\RuntimeException;
use Elasticsearch\Endpoints\AbstractEndpoint;

/**
 * Class GetAsync
 * Elasticsearch API name sql.get_async
 *
 * NOTE: this file is autogenerated using util/GenerateEndpoints.php
 * and Elasticsearch 7.15.0-SNAPSHOT (9fb2eb1c5228090f825b0a28287b80a0e446b2a8)
 */
class GetAsync extends AbstractEndpoint
{

    public function getURI(): string
    {
        $id = $this->id ?? null;

        if (isset($id)) {
            return "/_sql/async/$id";
        }
        throw new RuntimeException('Missing parameter for the endpoint sql.get_async');
    }

    public function getParamWhitelist(): array
    {
        return [
            'delimiter',
            'format',
            'keep_alive',
            'wait_for_completion_timeout'
        ];
    }

    public function getMethod(): string
    {
        return 'GET';
    }
}
