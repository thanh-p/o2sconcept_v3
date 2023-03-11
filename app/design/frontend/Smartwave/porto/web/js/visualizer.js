var visualContents = document.querySelectorAll(".visual_tab_content");
var wrapMobileOverlay = document.getElementById("wrap-mobile-overlay");
var headTabList = document.getElementById("head-wrap-mobile");
var visualWrap = document.querySelector(".visualizer-wrap");
var titleHeadTabList = document.getElementById("title-head-tab-list");
var tabDataItem = {};
var tabData = [];
for (let i = 0; i < visualContents.length; i++) {
    tabDataItem.currentScene = "";
    tabDataItem.selectedSceneId = "";
    tabDataItem.indexSelectedScene = -1;
    tabDataItem.selectedProductId = "";
    tabDataItem.indexSelectedProduct = -1;
    tabData.push({ ...tabDataItem });
}
var useUrl = {};
var usedUrls = [];

function tabify(visualTabContent, index) {
    let tabList = visualTabContent.querySelector(".tab__list");
    let VisualizerImage = document.getElementById("VisualImage" + visualTabContent.id);

    if (tabList) {
        let tabItems = [...tabList.querySelectorAll('.tab-text')];
        let sceneCarousels = visualTabContent.querySelector(".scene_carousels");
        // let productSelections = [...sceneCarousels.children];
        let productSelections = [...sceneCarousels.querySelectorAll(".scene_carousel")];

        let product_selections = document.getElementById("product_selections" + visualTabContent.id);
        let tabIndex = 0;

        tabIndex = tabItems.findIndex((item, index) => {
            return [...item.classList].indexOf("is--active") > -1;
        });

        tabIndex > -1 ? (tabIndex = tabIndex) : (tabIndex = 0);

        function setTab(index) {
            setActiveClass(productSelections, index);
            setActiveClass(tabItems, index);

            //add demo class for VisualizerImage
            if (index == 2) {
                VisualizerImage.classList.add("demo");
            } else if (VisualizerImage.classList.contains("demo") && tabData[index].selectedProductId == '') {
                VisualizerImage.classList.remove("demo");

            }
        }

        tabItems.forEach((x, index) =>
            x.addEventListener("click", () => setTab(index))
        );
        setTab(tabIndex);


        //add listener for next to type btn
        let next_type_button = document.getElementById("next_type_button" + visualTabContent.id);
        next_type_button.addEventListener("click", () => setTab(1));
        //add listener for back to scene button
        let back_to_scene_button = document.getElementById("back_to_scene_button" + visualTabContent.id);
        back_to_scene_button.addEventListener("click", () => setTab(0));
        //add listener for back to type button
        let back_to_type_button = document.getElementById("back_to_type_button" + visualTabContent.id);
        back_to_type_button.addEventListener("click", () => setTab(1));
        //add listener for see all
        let see_all = document.getElementById("see_all" + visualTabContent.id);

        see_all.addEventListener("click", () => {
            let categoryId = visualTabContent.id;
            let apiUrl = window.location.protocol + '//' + window.location.hostname + '/rest/V1/custom/getMoreProductSelectionsById/?categoryId=' + categoryId + '&parentCategoryId=' + visualTabContent.id + '&currentPage=' + 1;
            // reset product_selections before load all products
            product_selections.innerHTML = "";
            fetch(apiUrl)
                .then((response) => response.json())
                .then((data) => {
                    product_selections.innerHTML = data;
                    //add listener for new products
                    let products = [...productSelections[2].querySelectorAll('.product-overlay')]
                    addEventListenerProduct(products);
                    handleSeeMore(product_selections);
                });
            setTab(2);
        });

        //handle for select product type
        let productTypeWraps = [...productSelections[1].querySelectorAll('.product-overlay')];
        let productTypes = [...productSelections[1].querySelectorAll('.product-wrap')];
        productTypeWraps.forEach((selection, i) => {
            selection.addEventListener("click", () => {
                let categoryId = selection.id;
                let apiUrl = window.location.protocol + '//' + window.location.hostname + '/rest/V1/custom/getMoreProductSelectionsById/?categoryId=' + categoryId + '&parentCategoryId=' + visualTabContent.id + '&currentPage=' + 1;
                product_selections.innerHTML = "";
                //reset data for selected product
                tabData[index].selectedProductId = '';
                tabData[index].indexSelectedProduct = -1;
                fetch(apiUrl)
                    .then((response) => response.json())
                    .then((data) => {
                        product_selections.innerHTML = data;

                        //add listener for new products
                        let products = [...productSelections[2].querySelectorAll('.product-overlay')]
                        addEventListenerProduct(products);
                        handleSeeMore(product_selections);
                    });
                //active type
                setActiveClass(productTypeWraps, i);
                setActiveClass(productTypes, i);
                setTab(2);
            })
        });

        //get all sceneOverlays
        let sceneOverlays = [...productSelections[0].querySelectorAll('.scene-overlay')];
        //get all scenes
        let scenes = [...productSelections[0].querySelectorAll('.visualizer_scene')];

        if (sceneOverlays && scenes) {
            //auto select the first scene
            if (tabData[index].currentScene == '') {
                tabData[index].currentScene = sceneOverlays[0].getAttribute("data-sku");
                tabData[index].selectedSceneId = sceneOverlays[0].id.replace('-' + visualTabContent.id, "");
                tabData[index].indexSelectedScene = 0;
            }
            setVisualImage(VisualizerImage, index);
            //add listener for scenes
            sceneOverlays.forEach((selection, i) => {
                selection.addEventListener("click", () => {
                    tabData[index].currentScene = selection.getAttribute("data-sku");
                    tabData[index].indexSelectedScene = i;
                    tabData[index].selectedSceneId = selection.id.replace('-' + visualTabContent.id, "");
                    setVisualImage(VisualizerImage, index);

                    //active scene
                    setActiveClass(sceneOverlays, i);
                    setActiveClass(scenes, i);

                    //next to select product type
                    if (tabData[index].selectedProductId == '') {
                        setTab(1);
                    }
                })
            });
        }

        //add listener for products
        let products = [...productSelections[2].querySelectorAll('.product-overlay')]
        addEventListenerProduct(products);

        // handle "Xem them" in the first time load page
        handleSeeMore(product_selections);

        function handleSeeMore(product_selections) {
            let seeMoreBtn = product_selections.querySelector('.see-more-btn')
            if (seeMoreBtn) {
                let nextPage = seeMoreBtn.getAttribute("data-nextPage");
                let subCategoryId = seeMoreBtn.getAttribute("data-subCategoryId");
                let parentCategoryId = seeMoreBtn.getAttribute("data-parentCategoryId");
                let loader = product_selections.querySelector(".loader");

                seeMoreBtn.addEventListener("click", () => {
                    let apiUrl = window.location.protocol + '//' + window.location.hostname + '/rest/V1/custom/getMoreProductSelectionsById/?categoryId=' + subCategoryId + '&parentCategoryId=' + parentCategoryId + '&currentPage=' + nextPage;
                    seeMoreBtn.style.display = "none";
                    loader.style.display = "block";
                    fetch(apiUrl)
                        .then((response) => response.json())
                        .then((data) => {
                            product_selections.removeChild(seeMoreBtn);
                            product_selections.removeChild(loader);
                            product_selections.innerHTML = product_selections.innerHTML + data;
                            //add listener for new products
                            let products = [...productSelections[2].querySelectorAll('.product-overlay')]
                            addEventListenerProduct(products);
                            handleSeeMore(product_selections);
                        });
                })
            }
        }
        function addEventListenerProduct(products) {
            products.forEach((selection, i) => {
                // todo: add listener for new product only
                // if (selection.getAttribute('listener') !== 'true') {
                if (1) {
                    selection.addEventListener("click", () => {
                        let shopThisProductBtn = document.getElementById("shop-this-product" + visualTabContent.id);
                        //unset proudct if this already selected
                        if (tabData[index].selectedProductId == selection.id.replace('-' + visualTabContent.id, "")) {
                            //set content overlay
                            if (tabData[index].indexSelectedProduct > -1) {
                                products[tabData[index].indexSelectedProduct].querySelector('.overlay-content').innerHTML = 'Chọn sản phẩm';
                            }
                            //disable ship this product button
                            if (shopThisProductBtn.getAttribute('disabled') == null) {
                                shopThisProductBtn.setAttribute("disabled", "disabled");
                            }
                            tabData[index].selectedProductId = '';
                            tabData[index].indexSelectedProduct = -1;

                        } else {
                            tabData[index].selectedProductId = selection.id.replace('-' + visualTabContent.id, "");
                            tabData[index].indexSelectedProduct = i;
                            //set content overlay
                            selection.querySelector('.overlay-content').innerHTML = 'Bỏ Chọn';

                            //change href for shopThisProduct Btn
                            let productUrl = selection.getAttribute('data');
                            //enable ship this product button
                            if (shopThisProductBtn.getAttribute('disabled') != null) {
                                shopThisProductBtn.removeAttribute("disabled")
                            }
                            shopThisProductBtn.setAttribute('onclick', 'location.href="' + productUrl + '"');
                        }

                        //active product
                        let allProducts = [...productSelections[2].querySelectorAll('.product-overlay')]
                        setActiveProduct(allProducts, i);
                        let allWraps = [...productSelections[2].querySelectorAll('.product-wrap')]
                        setActiveProduct(allWraps, i);

                        setVisualImage(VisualizerImage, index);
                    })
                    selection.setAttribute('listener', 'true');
                }
            });
        }
    }
}

function getUsedUrl(apiUrl) {
    for (let i = 0; i < usedUrls.length; i++) {
        if (usedUrls[i].url == apiUrl) {
            return usedUrls[i].data;
        }
    }
    return '';
}

function setVisualImage(VisualizerImage, index) {
    if (VisualizerImage) {
        let apiUrl = '';
        if (tabData[index].selectedProductId != '') {
            apiUrl = window.location.protocol + '//' + window.location.hostname + '/rest/V1/custom/getVisualImage/?id=' + tabData[index].selectedProductId + '&selectedScene=' + tabData[index].currentScene;
        } else {
            apiUrl = window.location.protocol + '//' + window.location.hostname + '/rest/V1/custom/getProductUrlById/?id=' + tabData[index].selectedSceneId;
        }
        let imageUrl = getUsedUrl(apiUrl)
        if (imageUrl == '') {
            fetch(apiUrl)
                .then((response) => response.json())
                .then((data) => {
                    if (data != "") {
                        VisualizerImage.style.backgroundImage = "url('" + data + "')";
                    } else {
                        alert('Xin lỗi, sản phẩm bạn chọn chưa hỗ trợ trải nghiệm trên bối cảnh hiện tại. Vui lòng chọn bối cảnh khác và thử lại.');
                    }
                    useUrl.url = apiUrl;
                    useUrl.data = data;
                    usedUrls.push({ ...useUrl });
                });
        } else {
            VisualizerImage.style.backgroundImage = "url('" + imageUrl + "')";
        }
    }
}

function visualizerTabify(visualWrap) {
    let tabList = visualWrap.querySelector(".head_tab__list");
    let tabListMobile = document.getElementById("head-wrap-mobile");
    let tabListDesktop = document.getElementById("head-wrap-desktop");

    if (tabList) {
        let labelInsideTabItems = [...tabList.querySelectorAll(".tab-text")];
        // let tabItems = [...tabList.children];

        // sync product type in mobile and  desktop
        let tabItemsDesktop = [...tabListDesktop.querySelectorAll(".tab__item-head")];
        let tabItemsMobile = [...tabListMobile.querySelectorAll(".tab__item-head")];
        let tabContent = visualWrap.querySelector(".visual_content");
        let tabContentItems = [...tabContent.querySelectorAll(".visual_tab_content")];
        let tabIndex = 0;

        tabIndex = tabItemsDesktop.findIndex((item, index) => {
            return [...item.classList].indexOf("is--active") > -1;
        });
        if (!tabIndex > -1) {
            tabIndex = tabItemsMobile.findIndex((item, index) => {
                return [...item.classList].indexOf("is--active") > -1;
            });
        }
        tabIndex > -1 ? (tabIndex = tabIndex) : (tabIndex = 0);

        let headTabListMobile = document.getElementById("head-wrap-mobile");
        let headItems = headTabListMobile.querySelectorAll(".tab__item-head");

        function setTabMobile(index) {
            setActiveClass(tabContentItems, index);
            // sync active product
            setActiveClass(tabItemsDesktop, index);
            setActiveClass(tabItemsMobile, index);
            //set active for label inside tabitem
            setActiveClass(labelInsideTabItems, index);
            hideWrapMobile();
        }
        function setTab(index) {
            setActiveClass(tabContentItems, index);
            // sync active product
            setActiveClass(tabItemsDesktop, index);
            setActiveClass(tabItemsMobile, index);
            //set active for label inside tabitem
            setActiveClass(labelInsideTabItems, index);
        }
        function hideWrapMobile(){
            headItems.forEach((item) => {
                item.style.display = "none";
                wrapMobileOverlay.style.display = "none";
            })
        }
        tabItemsDesktop.forEach((x, index) =>
            x.addEventListener("click", () => {
                setTab(index);
            })
        );
        tabItemsMobile.forEach((x, index) =>
            x.addEventListener("click", () => {
                setTabMobile(index);
            })
        );
        setTab(tabIndex);
        setTabMobile(tabIndex)
        wrapMobileOverlay.addEventListener("click", () => {
            wrapMobileOverlay.style.display = "none";
            hideWrapMobile();
        })
    }
}

function setActiveClass(list, index) {
    list.forEach((x) => x.classList.remove("is--active"));
    list[index].classList.add("is--active");
}

function setActiveProduct(list, index) {
    if (list[index].classList.contains("is--active")) {
        list[index].classList.remove("is--active");
    } else {
        list.forEach((x) => x.classList.remove("is--active"));
        list[index].classList.add("is--active");
    }

}

//handle for change product type
function handleChangeProduct() {
    titleHeadTabList.addEventListener("click", () => {
        let headItems = headTabList.querySelectorAll(".tab__item-head");
        headItems.forEach((item) => {
            item.style.display = "block";
        })
        wrapMobileOverlay.style.display = "block";
    });
}


visualContents.forEach((visualContent, index) =>
    tabify(visualContent, index)
);
visualizerTabify(visualWrap);
handleChangeProduct();
