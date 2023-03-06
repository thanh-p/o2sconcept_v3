<?php
namespace Smartwave\Visualizer\Model\Api;
use Magento\Framework\App\Action\Action; 
class Custom extends \Magento\Framework\View\Element\Template
{
    protected $_helper;
    protected $_searchCriteriaBuilder;

	protected $_productRepository;
    protected $_productCollectionFactory;
    private $_MediaBaseUrl="";
    /**
     * @var \Magento\Framework\Controller\Result\JsonFactory
     */
    private $jsonResultFactory;

    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Catalog\Model\ProductRepository $productRepository,
        \Magento\Framework\Controller\Result\JsonFactory $jsonResultFactory,
        \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $productCollectionFactory,
        \Smartwave\Visualizer\Helper\Data $helper,
        \Magento\Framework\Api\SearchCriteriaBuilder $searchCriteriaBuilder

    ) {
        $this->_MediaBaseUrl = $this->getMediaBaseUrl() . 'catalog/product';
        $this->_productRepository = $productRepository;
        $this->_helper = $helper;
        $this->_searchCriteriaBuilder = $searchCriteriaBuilder;
        $this->_productCollectionFactory = $productCollectionFactory;
        $this->jsonResultFactory = $jsonResultFactory;
        parent::__construct($context);

    }
    public function getProductById($id)
	{
		return $this->_productRepository->getById($id);
	}
    private function getMediaBaseUrl() {

        $om = \Magento\Framework\App\ObjectManager::getInstance();
        
        $storeManager = $om->get('Magento\Store\Model\StoreManagerInterface');
        
        $currentStore = $storeManager->getStore();
        return $currentStore->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA);
    }

    /**
     * @inheritdoc
     */

    public function getProductUrlById($id)
    {
        $productImageUrl = '';
        $product = $this->getProductById($id);
        if ($product) {
            $productImageUrl = $this->_MediaBaseUrl . $product->getImage();
        }
        return $productImageUrl;
    }

    /**
     * @inheritdoc
     */

    public function getProductSelectionsById($categoryId, $parentCategoryId)
    {
        // get product in a type from category ex: Film trang trí kính 1. Include products in a type product.
        return $this->_helper->getProductSelectionsHtml($categoryId, $parentCategoryId);
    }
    public function getVisualImage($id, $selectedScene)
    {
        $productImageUrls = [];
        $productImageUrl = '';
        $product = $this->getProductById($id);
        if ($product) {
            $productImageUrls = $product->getMediaGalleryEntries();
            if ($productImageUrls){
                foreach ($productImageUrls as $image) {
                    if ($selectedScene == $image->getLabel()) {
                        $productImageUrl = $this->_MediaBaseUrl . $image->getFile();
                    }
                   }
            }
        }
        return $productImageUrl;
    }
}