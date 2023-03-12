<?php
namespace Smartwave\Visualizer\Block;
use Magento\Framework\App\Action\Action; 

class Visualizer extends \Magento\Framework\View\Element\Template
{
    
const PARAM_NAME_BASE64_URL = 'r64';
const PARAM_NAME_URL_ENCODED = 'uenc';
    private $_productRepository;
    private $_variable;
    protected $_categoryRepository;
    private $_category;
    private $_subCategories;

    protected $_helper;

    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $productCollectionFactory,
        \Magento\Catalog\Model\ProductRepository $productRepository,
        \Magento\Catalog\Model\CategoryRepository $categoryRepository,
        \Smartwave\Visualizer\Helper\Data $helper,
    )
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $this->_productRepository = $productRepository;
        $this->_helper = $helper;
        $this->_variable = $objectManager->create('Magento\Variable\Model\Variable');
        $this->_categoryRepository = $categoryRepository;
        $this->_category = $this->_categoryRepository->get($this->_helper->getVariableValue('products_id'));
        $this->_subCategories = $this->_category->getChildrenCategories();
        parent::__construct($context);
    }
    public function getVisualHeader()
    {
        $result = "";
        if ($this->_subCategories) {
            foreach ($this->_subCategories as $subCategory) {
                $result = $result . '<div class="tab__item-head"><p class="tab-text">' . $subCategory->getName() . '</p></div>';
            }
        }
        return $result;
    }
    public function getVisualContent()
    {
        $result = "";
        if ($this->_subCategories) {
            foreach ($this->_subCategories as $subCategory) {
                $result = $result .
                    '<div class="visual_tab_content" id="' . $subCategory->getId() . '">' .
                    $this->gettabContentItem($subCategory) . '
                </div>';
            }
        }
        return $result;
    }
    public function getTabList(string $name)
    {
        $result = "";
        $result = $result . '
        <div class="tab__item tab__item1"><p class="tab-text">Bối cảnh</p></div>
        <div class="tab__item tab__item2"><p class="tab-text">Loại ' . $name . '</p></div>
        <div class="tab__item tab__item3"><p class="tab-text">Mẫu thực tế</p></div>';
        return $result;
    }


    public function gettabContentItem($subCategory)
    {
        $result = "";
        $subCategoryName = strtok($subCategory->getName(), " ");

        $sceneSelectionsHtml = "";
        $productSelectionsHtml = "";

        $sceneCategoryId = $this->_helper->getVariableValue('scenes_for_' . $subCategory->getId());
        if ($sceneCategoryId != '') {
            $sceneCollection = $this->_helper->getProductCollectionByCategories($sceneCategoryId);
            if ($sceneCollection) {
                foreach ($sceneCollection as $scene) {
                    if ($scene) {
                        $sceneSelectionsHtml = $sceneSelectionsHtml . '
                    <div class="visualizer_scene">
                        <img class="selection-scene-image" title="hình ảnh của '.$scene->getName().'" src="' . $this->_helper->getSceneThumbnailUrl($scene) . '">
                        <div class="scene-overlay"  id="' . $scene->getId() . '-' . $subCategory->getId() . '" data-sku="' . $scene->getSku() . '">
                        </div>
                    </div>';
                    }
                }
            }
            // get all product from category ex: Film trang trí kính. Include all types. Because the first time => current page = 1
            $productSelectionsHtml = $this->_helper->getMoreProductSelectionsHtml($subCategory->getId(),$subCategory->getId(), 1);
        }

        $result = $result . '
        <div class="tab__content-item">
            <div class="tab__list"><div class="title-tab-list">không gian của bạn</div>
                ' . $this->getTabList($subCategoryName) . '
            </div>
            <div class="tab__contents" id="VisualImage' . $subCategory->getId() . '" src="" alt="hình ảnh ' . $subCategory->getName() . '">
            </div>
        </div>
        <div class="scene_carousels">
            <div class="scene_carousel">
                <div class="selections">' .
                    $sceneSelectionsHtml . 
                '</div>
                <div class="button-group">
                <button id="next_type_button' . $subCategory->getId() . '" class=" scene_carousel_button" "> 
                    Chọn loại ' . $subCategoryName . ' 
                </button>
                </div>
            </div>
            <div class="scene_carousel">'.
                $this->getProductTypes($subCategory) . '
                <div class="button-group">
                <button id="back_to_scene_button' . $subCategory->getId() . '" type="button" class=" scene_carousel_button"> 
                    <i class="pre-action scene_carousel_icon" ></i>Trở về trước
                </button>
                <button id="see_all' . $subCategory->getId() . '" class="scene_carousel_button attention-button" > Xem tất cả</button>
                </div>
            </div>
            <div class="scene_carousel">
                <div id="product_selections' . $subCategory->getId() . '" class="selections">'.
                    $productSelectionsHtml .
                '</div>
                <div class="button-group">
                    <button id="back_to_type_button' . $subCategory->getId() . '" type="button" class=" scene_carousel_button"> 
                        <i class="pre-action scene_carousel_icon" ></i>Chọn loại ' . $subCategoryName . ' 
                    </button>
                    <button id="shop-this-product' . $subCategory->getId() . '" onclick="" type="button" class="scene_carousel_button attention-button" disabled="disabled">Mua sản phẩm này</button>
                </div>
            </div>
        </div>';
        return $result;

    }
    public function getProductTypes($category)
    {
        $subCategories = $category->getChildrenCategories();
        $productTypesHtml = '';
        if ($subCategories) {
            foreach ($subCategories as $subCategory) {
                $productTypesHtml = $productTypesHtml . $this->_helper->getProducTypestHtml($subCategory);
            }
        }
        return
            '<ul class ="selection_ul">
        ' . $productTypesHtml . '
        </ul>';
    }
    public function getTestProduct($id)
    {
        return $this->_productRepository->getById($id);
    }
    public function getAddToCartPostParams($product)
    {
        return $this->_helper->getAddToCartPostParams($product);
    }
}