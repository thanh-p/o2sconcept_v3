<?php
namespace Smartwave\Visualizer\Api;
 
interface CustomInterface
{
    /**
     * GET for getProductUrlById
     * @param int $id
     * @return string
     */
    public function getProductUrlById($id);

    /**
     * GET for getProductSelectionsById
     * @param int $categoryId
     * @param int $parentCategoryId
     * @return string
     */

    public function getProductSelectionsById($categoryId, $parentCategoryId);

    /**
     * GET for getVisualImage api
     * @param int $id
     * @param string $selectedScene
     * @return string
     */
 
     public function getVisualImage($id, $selectedScene);

        /**
     * GET for getMoreProductSelectionsById
     * @param int $categoryId
     * @param int $parentCategoryId
     * @param int $currentPage
     * @return string
     */

     public function getMoreProductSelectionsById($categoryId, $parentCategoryId, $currentPage);
}