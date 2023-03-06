<?php
namespace Smartwave\Visualizer\Helper;
use Magento\Catalog\Model\Product\Attribute\Source\Status;

class Data extends \Magento\Framework\App\Helper\AbstractHelper
{
    private $_variable;
    protected $_categoryRepository;
    protected $_productCollectionFactory;
    private $_productCategoryId;
    private $_category;
    private $_subCategories;
    private $_listProductBlock;
    public function __construct(
        \Magento\Framework\App\Helper\Context $context,
        \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $productCollectionFactory,
        \Magento\Catalog\Model\CategoryRepository $categoryRepository,
        \Magento\Catalog\Block\Product\ListProduct $listProductBlock,
        \Magento\Framework\Api\SearchCriteriaBuilder $searchCriteriaBuilder
    )
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $this->_variable = $objectManager->create('Magento\Variable\Model\Variable');
        $this->_productCategoryId = $this->getVariableValue('products_id');
        $this->_categoryRepository = $categoryRepository;
        $this->_productCollectionFactory = $productCollectionFactory;
        $this->_category = $this->_categoryRepository->get($this->_productCategoryId);
        $this->_subCategories = $this->_category->getChildrenCategories();
        $this->_listProductBlock = $listProductBlock;

        parent::__construct($context);
    }
    public function getAddToCartPostParams($product)
    {
        return $this->_listProductBlock->getAddToCartPostParams($product);
    }
    public function getAddToWishlistParams($product)
    {
        return $this->_listProductBlock->getAddToWishlistParams($product);
    }

    public function getProductTypeThumbnailUrl($product)
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $helperImport = $objectManager->get('\Magento\Catalog\Helper\Image');
        return $helperImport->init($product, 'product_page_image_small')
            ->setImageFile($product->getThumbnail()) // image,small_image,thumbnail
            ->resize(300, 245)
            ->getUrl();
    }
    public function getSceneThumbnailUrl($product)
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $helperImport = $objectManager->get('\Magento\Catalog\Helper\Image');
        return $helperImport->init($product, 'product_page_image_small')
            ->setImageFile($product->getThumbnail()) // image,small_image,thumbnail
            ->resize(220, 147)
            ->getUrl();
    }
    public function getProductThumbnailUrl($product)
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $helperImport = $objectManager->get('\Magento\Catalog\Helper\Image');
        return $helperImport->init($product, 'product_page_image_small')
            ->setImageFile($product->getThumbnail()) // image,small_image,thumbnail
            ->resize(300, 300)
            ->getUrl();
    }
    public function getProductCollectionByCategories($ids)
    {
        $collection =
            $this->_productCollectionFactory->create()
                ->addAttributeToSelect('*')
                ->addCategoriesFilter(['in' => $ids]);
        return $collection;
    }

    public function getProductSelectionsHtml($subCategoryId, $parentCategoryId){
        $productSelectionsHtml = '';
        if ($subCategoryId) {
            $productCollection = $this->getProductCollectionByCategories($subCategoryId);
            $productCollection->setPageSize(5);

            if ($productCollection) {
                // if ($productCollection->count() > 2) {
                //     $productCollection =array_slice($productCollection, 0, 2);
                // }
                foreach ($productCollection as $product) {
                    if ($product) {
                        $productSelectionsHtml = $productSelectionsHtml . '
                    <div class="product-wrap">
                        <div class="visualizer_product" >
                            <img class="selection-image" alt="hình ảnh của ' . $product->getName() . '"  title="hình ảnh của ' . $product->getName() . '"  src="' . $this->getProductThumbnailUrl($product) . '">
                        </div>
                        <div class="product-overlay" id="' . $product->getId() . '-' . $parentCategoryId . '" data="' . $product->getProductUrl() . '">
                        <div class="overlay-content">Chọn sản phẩm</div>
                        </div>
                    </div>';
                    }
                }
            }
        }
        if($this ->hasNextPage(1, $productCollection)){
            return $productSelectionsHtml.'<button id="see-more'. $parentCategoryId . '" onclick="" type="button" class="product-wrap attention-button see-more-btn" >Xem thêm</button>';
        } else {
            return $productSelectionsHtml;
        } 
    }
    
    public function hasNextPage($currentPage, $collection)
    {
        $lastPageNumber = $collection->getLastPageNumber();
        if ($lastPageNumber > $currentPage) {
            return true;
        } else {
            return false;
        }
    }
    public function getProducTypestHtml($subCategory){
        $typeSelectionsHtml = '';
        if ($subCategory) {
            $productCollection = $this->getProductCollectionByCategories($subCategory->getId());
            if ($productCollection) {
                $product = $productCollection->getFirstItem();
                if ($product) {
                    $typeSelectionsHtml = $typeSelectionsHtml . '
                <div class="product-wrap">
                    <div class="visualizer_product" >
                        <img class="selection-type-image" alt="hình ảnh của ' . $product->getName() . '"  title="hình ảnh của ' . $product->getName() . '"  src="' . $this->getProductTypeThumbnailUrl($product) . '">
                        <div class="type-selection">'.$subCategory->getName().'</div>
                    </div>
                    <div class="product-overlay" id="' . $subCategory->getId() . '" >
                    <div class="overlay-content">Chọn loại '.strtok($subCategory->getName(), " ").'</div>
                    </div>
                </div>';
                }
            }
        }
        return $typeSelectionsHtml;
    }
    // public function testApi()
    // {
    //     $sceneCategoryId = 51;
    //     $disabledProducts =
    //         $this->_productCollectionFactory->create()
    //             ->addAttributeToSelect('*');
    //             // ->addAttributeToFilter('status', Status::STATUS_DISABLED)
    //             // ->addCategoriesFilter(['in' => $sceneCategoryId]);

    //     $productImageUrl = "test";
    //     foreach ($disabledProducts as $product) {
    //         if ($product) {
    //             $productImageUrl =  $productImageUrl.'<br>'.$product->getImage();
    //         }
    //     }
    //     return $productImageUrl;
    // }
    public function getVariableValue($code)
    {
        $value = $this->_variable->loadByCode($code)->getPlainValue();
        return $value;
    }


}