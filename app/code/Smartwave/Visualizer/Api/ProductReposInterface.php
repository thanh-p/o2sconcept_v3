<?php
namespace Smartwave\Visualizer\Api;
 
interface ProductReposInterface
{
    /**
     * GET for getVisualImage api
     * @param int $id
     * @param int $selectedScene
     * @return string
     */
 
    public function getVisualImage($id, $selectedScene);
}