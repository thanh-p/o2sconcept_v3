<?php

namespace Smartwave\TestApi\Model\Api;
use Illuminate\Support\collection;

class TestApiManagement implements \Smartwave\TestApi\Api\TestApiManagementInterface
{
    const SEVERE_ERROR = 0;
    const SUCCESS = 1;
    const LOCAL_ERROR = 2;

    protected $_testApiFactory;

    public function __construct(
        \Smartwave\TestApi\Model\TestApiFactory $testApiFactory,
        \Magento\Catalog\Model\CategoryFactory $categoryFactory,
        \Magento\Catalog\Api\ProductRepositoryInterface $productRepository
    ) {
        $this->_testApiFactory = $testApiFactory;
        $this->categoryFactory = $categoryFactory;
        $this->productRepository = $productRepository;
    }

    /**
     * get test Api data.
     *
     * @api
     *
     * @param int $id
     *
     * @return \Smartwave\TestApi\Api\Data\TestApiInterface
     */
    public function getApiData($id)
    {
        try {
            // $model = $this->_testApiFactory
            //     ->create();

            $category = $this->categoryFactory->create()->load($id);
            $outputs = array();

            foreach ($category->getProductCollection() as $product) {
                $sku = $product->getSku();
                $loaded_product = $this->productRepository->get($sku);
                $name = $loaded_product->getName();
                $url = $loaded_product->getProductUrl();

                $productImageUrls = $loaded_product->getMediaGalleryImages();
                $productImageUrl;
                if ($productImageUrls != NULL) {
                    $productImageUrl = $productImageUrls->getFirstItem()->getUrl();
                }

                if ($productImageUrl == NULL) {
                    $productImageUrl = "";
                }

                $output = array($name, $sku, $url, $productImageUrl);
                array_push($outputs, $output);
            }

            // if (!$model->getId()) {
            //     throw new \Magento\Framework\Exception\LocalizedException(
            //         __('no data found')
            //     );
            // }

            return json_encode($outputs);
        } catch (\Magento\Framework\Exception\LocalizedException $e) {
            $returnArray['error'] = $e->getMessage();
            $returnArray['status'] = 0;
            $this->getJsonResponse(
                $returnArray
            );
        } catch (\Exception $e) {
            $this->createLog($e);
            $returnArray['error'] = __('unable to process request');
            $returnArray['status'] = 2;
            $this->getJsonResponse(
                $returnArray
            );
        }
    }
}