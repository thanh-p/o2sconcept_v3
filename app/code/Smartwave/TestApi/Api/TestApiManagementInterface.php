<?php

namespace Smartwave\TestApi\Api;

interface TestApiManagementInterface
{
    /**
     * get test Api data.
     *
     * @api
     *
     * @param int $id
     *
     * @return \Smartwave\TestApi\Api\Data\TestApiInterface
     */
    public function getApiData($id);
}