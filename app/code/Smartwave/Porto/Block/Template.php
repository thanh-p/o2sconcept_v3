<?php

namespace Smartwave\Porto\Block;

class Template extends \Magento\Framework\View\Element\Template {
    public $_coreRegistry;
    
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        \Magento\Framework\Registry $coreRegistry,
        \Magento\Catalog\Api\ProductRepositoryInterface $productRepository,
        array $data = []
    ) {
        $this->_coreRegistry = $coreRegistry;
        $this->productRepository = $productRepository;
        parent::__construct($context, $data);
    }
    
    public function getConfig($config_path, $storeCode = null)
    {
        return $this->_scopeConfig->getValue(
            $config_path,
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE,
            $storeCode
        );
    }
    
    public function getFooterLogoSrc(){
        $folderName = \Smartwave\Porto\Model\Config\Backend\Image\Logo::UPLOAD_DIR;
        $storeLogoPath = $this->_scopeConfig->getValue(
            'porto_settings/footer/footer_logo_src',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
        $path = $folderName . '/' . $storeLogoPath;
        $logoUrl = $this->_urlBuilder
                ->getBaseUrl(['_type' => \Magento\Framework\UrlInterface::URL_TYPE_MEDIA]) . $path;
        return $logoUrl;
    }
    
    public function isHomePage()
    {
        $currentUrl = $this->getUrl('', ['_current' => true]);
        $urlRewrite = $this->getUrl('*/*/*', ['_current' => true, '_use_rewrite' => true]);
        return $currentUrl == $urlRewrite;
    }

    public function getProductImageBySku($sku) {
        try {
            $loaded_product = $this->productRepository->get($sku);
        }  catch (\Exception $e) {
            return "";
        }

        $productImageUrls = $loaded_product->getMediaGalleryImages();
        $productImageUrl = "";
        if ($productImageUrls != NULL) {
            $productImageUrl = $productImageUrls->getFirstItem()->getUrl();
        }
        return $productImageUrl;
    }

    public function getReviewBySku($sku) {
        $output = array("", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", "");

        try {
            $loaded_product = $this->productRepository->get($sku);
        }  catch (\Exception $e) {
            return $output;
        }

        $productImageUrls = $loaded_product->getMediaGalleryImages();
        $productImageUrl = "";
        if ($productImageUrls != NULL) {
            $productImageUrl = $productImageUrls->getFirstItem()->getUrl();
        }


        $output[0] = $loaded_product->getName();
        $output[1] = strip_tags($loaded_product->getShortDescription());
        $output[2] = $productImageUrl;

        return $output;
    }
}
?>