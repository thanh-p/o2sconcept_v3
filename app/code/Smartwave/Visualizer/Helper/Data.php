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
            ->resize(150, 150)
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
    public function getConfigProductCollectionByCategories($ids)
    {
        $collection = $this->_productCollectionFactory->create()
            ->addAttributeToSelect('*')
            ->addCategoriesFilter(['in' => $ids])
            ->addAttributeToFilter('type_id', \Magento\ConfigurableProduct\Model\Product\Type\Configurable::TYPE_CODE);
    
        return $collection;
    }
    public function getProductSelectionsHtml($subCategoryId, $parentCategoryId){
        $productSelectionsHtml = '';
        if ($subCategoryId) {
            $productCollection = $this->getConfigProductCollectionByCategories($subCategoryId);
            $productCollection->setPageSize(20);

            if ($productCollection) {
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
    
    public function getMoreProductSelectionsHtml($subCategoryId, $parentCategoryId, $currentPage){
        $productSelectionsHtml = '';
        if ($subCategoryId) {
            $productCollection = $this->getConfigProductCollectionByCategories($subCategoryId);
            $productCollection->setPageSize(20);
            $productCollection->setCurPage($currentPage);

            if ($productCollection) {
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
        if($this ->hasNextPage($currentPage, $productCollection)){
            $nextPage = $currentPage + 1;
            return $productSelectionsHtml.'<button data-nextpage="'.$nextPage.'" data-parentCategoryId="'.$parentCategoryId.'" data-subCategoryId="'.$subCategoryId.'" id="see-more'. $parentCategoryId . '" onclick="" type="button" class="attention-button see-more-btn" >Xem thêm</button>
            <div class="loader"></div>';
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
            $productCollection = $this->getConfigProductCollectionByCategories($subCategory->getId());
            if ($productCollection) {
                $product = $productCollection->getFirstItem();
                if ($product) {
                    $typeSelectionsHtml = $typeSelectionsHtml . '
                <div class="product-wrap">
                    <div class="visualizer_product" >
                        <div class="selection-type-image" alt="hình ảnh của ' . $product->getName() . '"  title="hình ảnh của ' . $product->getName() . '"  style="background-image: url('. $this->getProductTypeThumbnailUrl($product) . ')"></div>
                        <div class="type-selection">'.$subCategory->getName().'</div>
                    </div>
                    <div class="product-overlay" id="' . $subCategory->getId() . '" >
                    </div>
                </div>';
                }
            }
        }
        return $typeSelectionsHtml;
    }
    public function getVariableValue($code)
    {
        $value = $this->_variable->loadByCode($code)->getPlainValue();
        return $value;
    }


}