<?php
/**
 * Smartwave Software.
 *
 * @category  Smartwave
 *
 * @author    Smartwave
 * @copyright Copyright (c) 2010-2016 Smartwave Software Private Limited (https://Smartwave.com)
 * @license   https://store.Smartwave.com/license.html
 */

namespace Smartwave\TestApi\Api\Data;

/**
 * Marketplace product interface.
 *
 * @api
 */
interface TestApiInterface
{
    /**#@+
     * Constants for keys of data array. Identical to the name of the getter in snake case
     */
    const ENTITY_ID = 'entity_id';

    const TITLE = 'title';

    const DESC = 'description';
    /**#@-*/

    /**
     * Get ID.
     *
     * @return int|null
     */
    public function getId();

    /**
     * Set ID.
     *
     * @param int $id
     *
     * @return \Smartwave\Marketplace\Api\Data\ProductInterface
     */
    public function setId($id);

    /**
     * Get title.
     *
     * @return string|null
     */
    public function getTitle();

    /**
     * Set title.
     *
     * @param string $title
     *
     * @return \Smartwave\Marketplace\Api\Data\ProductInterface
     */
    public function setTitle($title);

    /**
     * Get desc.
     *
     * @return string|null
     */
    public function getDescription();

    /**
     * Set Desc.
     *
     * @param string $desc
     *
     * @return \Smartwave\Marketplace\Api\Data\ProductInterface
     */
    public function setDescription($desc);
}