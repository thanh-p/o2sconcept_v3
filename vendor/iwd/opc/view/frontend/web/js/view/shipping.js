var defineArray =  [
    'jquery',
    'uiComponent',
    'Magento_Checkout/js/model/full-screen-loader',
    'underscore',
    'Magento_Ui/js/form/form',
    'ko',
    'Magento_Customer/js/model/customer',
    'Magento_Customer/js/model/address-list',
    'Magento_Checkout/js/model/address-converter',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/action/create-shipping-address',
    'Magento_Checkout/js/action/select-shipping-address',
    'Magento_Checkout/js/model/shipping-rates-validator',
    'Magento_Checkout/js/model/shipping-service',
    'Magento_Checkout/js/action/select-shipping-method',
    'Magento_Checkout/js/model/shipping-rate-registry',
    'Magento_Checkout/js/action/set-shipping-information',
    'Magento_Checkout/js/model/checkout-data-resolver',
    'Magento_Checkout/js/checkout-data',
    'Magento_Catalog/js/price-utils',
    'uiRegistry',
    'mage/translate',
    'Magento_Checkout/js/model/cart/totals-processor/default',
    'IWD_Opc/js/model/payment/is-loading',
];

// Use AmazonPayStorage Script if AmazonPay is enabled
var amazonPayEnabled = false;
if(typeof(window.amazonPayment) !== "undefined") {
    amazonPayEnabled = true;
    defineArray.push('Amazon_Payment/js/model/storage');
}

defineArray.push(
    'Magento_Checkout/js/model/shipping-rate-service',
    'iwdOpcHelper',
    'mage/validation'
);

defineArray.push(
    'IWD_Opc/js/view/payment',
);

define( defineArray,
    function (
              $,
              uiComponent,
              fullScreenLoader,
              _,
              Component,
              ko,
              customer,
              addressList,
              addressConverter,
              quote,
              createShippingAddress,
              selectShippingAddress,
              shippingRatesValidator,
              shippingService,
              selectShippingMethodAction,
              rateRegistry,
              setShippingInformationAction,
              checkoutDataResolver,
              checkoutData,
              priceUtils,
              registry,
              $t,
              totalsDefaultProvider,
              paymentIsLoading,
              amazonStorage,
              payment)
        {

        amazonStorage = amazonStorage || null;
        var inlineAddress = "",
            newAddressOption = {
            getAddressInline: function () {
                return $t('New Address');
            },
            customerAddressId: null
        }, addressOptions = addressList().filter(function (address) {
            var isDublicate = inlineAddress === address.getAddressInline();
                inlineAddress = address.getAddressInline();
            return address.getType() === 'customer-address' && !isDublicate;
        });
        addressOptions.push(newAddressOption);

        var setShippingInformationTimeout = null,
            getTotalsTimeout = null,
            instance = null,
            totalsProcessors = [];

        window.fullScreenLoader = fullScreenLoader;

        $(document).on('focus','input',function (e) {
            $(this).closest('.control').addClass('focus');
        })
        $(document).on('focusout','input',function (e) {
            let val = $(this).val();
            if (!val || val.length === 0) {
                $(this).closest('.control').removeClass('focus');
            }
        })

        var defaults = {};
        defaults.template = 'IWD_Opc/shipping';
        defaults.shippingMethodItemTemplate = 'IWD_Opc/shipping-address/custom-shipping-list';

        return Component.extend({
            defaults,
            canHideErrors: true,
            isCustomerLoggedIn: customer.isLoggedIn,
            customerHasAddresses: addressOptions.length > 1,
            logoutUrl: quote.getLogoutUrl(),
            isAddressFormVisible: ko.observable(addressList().length === 0),
            saveInAddressBook: 1,
            addressOptions: addressOptions,
            selectedAddress: ko.observable(),
            displayAllMethods: window.checkoutConfig.iwdOpcSettings.displayAllMethods,
            specificMethodsForDisplayAllMethods: ['iwdstorepickup'],
            isAmazonAccountLoggedIn: amazonStorage.isAmazonAccountLoggedIn,

            quoteIsVirtual: quote.isVirtual(),

            isShowGiftMessage: quote.isShowGiftMessage(),
            isShowDelimiterAfterShippingMethods: quote.isShowComment() || quote.isShowGiftMessage(),
            isShowComment: quote.isShowComment(),
            commentValue: ko.observable(checkoutData.getComment()),


            rateBuilding: ko.observable(false),
            shippingRateGroups: ko.observableArray([]),
            shippingRates: ko.observableArray([]),
            shippingRate: ko.observable(),
            shippingRateGroup: ko.observable(),
            rates: shippingService.getShippingRates(),
            shippingRateGroupsCaption: ko.observable(null),
            shippingRatesCaption: ko.observable(null),
            isShippingRatesVisible: ko.observable(false),

            isRatesLoading: shippingService.isLoading,

            isFormInline: addressList().length === 0,
            shippingMethod : 'table.table-checkout-shipping-method tbody',

            checkoutData: window.checkoutData,

            customerEmail: quote.guestEmail ? quote.guestEmail : window.checkoutConfig.customerData.email,

            addressFields:['firstname','lastname','street','countryId','regionId','region','city','postcode','telephone'],

            resetShippingAddressForm: function () {
                let shippingAddress = $('#shipping-new-address-form');
                shippingAddress.find('input').val('');
                shippingAddress.find('.control.focus').removeClass('focus');
                let country_id = shippingAddress.find('select[name="country_id"]');
                let region_id = shippingAddress.find('select[name="region_id"]');
                country_id.selectize({})[0].selectize.clear(true);
                region_id.selectize({})[0].selectize.clear(true);
            },

            useBillingAddress: function() {
                if(this.isAddressShippingFormVisible()) {
                    this.checkoutData.infoBlock.isAddressSame(true);
                    this.isAddressShippingFormVisible(false);
                } else {
                    this.resetShippingAddressForm();
                    this.checkoutData.infoBlock.isAddressSame(false);
                    this.isAddressShippingFormVisible(true);
                }

                return true;
            },

            manageDeliveryComment: function() {
                if(this.isCommentVisible()) {
                    this.isCommentVisible(false);
                } else {
                    this.isCommentVisible(true);
                }
                return true;
            },

            goToShoppingCart: function() {
                this.startLoader();
                window.location.href = window.location.origin + '/checkout/cart/';
            },

            goToAddressStep: function() {
                let self = this,
                    summary = self.checkoutData.summary,
                    payment = self.checkoutData.payment;

                self.startLoader();
                self.CurrentStep(1);
                summary.updateSummaryWrapperTopHeight(0);
                self.AddressStep(true);
                self.DeliveryStep(false);
                payment.PaymentStep(false);
                self.stopLoader(500);

                return true;
            },

            goToDeliveryStep: function(type = 'multistep') {
                let self = this,
                    summary = self.checkoutData.summary,
                    isAddressMultiple = true,
                    billing = self.checkoutData.billing,
                    login = self.checkoutData.login,
                    payment = self.checkoutData.payment;

                self.startLoader();
                self.source.set('params.invalid', false);

                if (!customer.isLoggedIn()) {
                    if (!$("#iwd_opc_login form").validate().element("input[type='email']")) {
                        this.stopLoader(100);
                        return false;
                    }
                }

                if (self.isBillingFormFirst()) {
                    isAddressMultiple = self.isAddressSameAsBilling();

                    if(isAddressMultiple){
                        self.source.trigger('billingAddress.data.validate');
                    }

                } else {
                    isAddressMultiple = self.checkoutData.billing.isAddressSameAsShipping();

                    if (isAddressMultiple) {
                        self.source.trigger('shippingAddress.data.validate');
                    }
                }

                if (!isAddressMultiple) {
                    self.source.trigger('billingAddress.data.clearError');
                    self.source.trigger('shippingAddress.data.clearError');
                    self.source.set('params.invalid', false);
                    self.source.trigger('billingAddress.data.validate');
                    self.source.trigger('shippingAddress.data.validate');
                }

                if (self.source.get('params.invalid')) {
                    this.stopLoader(100);
                    return false;
                } else {
                    if (type === 'onepage') {
                        return true;
                    }
                    summary.updateSummaryWrapperTopHeight(0);
                    self.AddressStep(false);
                    self.DeliveryStep(true);
                    payment.PaymentStep(false);
                }

                self.CurrentStep(2);
                this.stopLoader(500);

                let selectShippingMethod = setInterval(function () {
                    if (!$('table.table-checkout-shipping-method tbody._active').length) {
                        if(self.isShippingMethodActive()){
                            self.isShippingMethodActive(false);
                            self.initShippingMethod();
                        }
                    }
                },500);

                setTimeout(function () {
                    clearInterval(selectShippingMethod);
                },5000)

                return true;
            },

            goToPaymentStep: function() {
                let self = this;

                self.startLoader();

                let shippingMethodForm = $('#co-shipping-method-form');
                shippingMethodForm.validate({
                    errorClass: 'mage-error',
                    errorElement: 'div',
                    meta: 'validate'
                });

                shippingMethodForm.validation();

                if (!shippingMethodForm.validation('isValid') || !quote.shippingMethod()) {
                    return false;
                } else {

                    self.AddressStep(false);
                    self.DeliveryStep(false);
                    self.checkoutData.payment.PaymentStep(true);
                }

                self.CurrentStep(3);

                self.stopLoader(500);

                return true;
            },

            isAddressHasError: function () {
                let self = this;

                // if delivery step available, address doesn't have errors
                if (self.goToDeliveryStep('onepage')) {
                    return false;
                }

                return true;
            },

            customerAddressesDecorateSelect: function (id) {
                let select = $('select#'+id);
                select.selectize({
                    allowEmptyOption: true,
                    onDropdownClose: function ($dropdown) {
                        $($dropdown).find('.selected').not('.active').removeClass('selected');
                    }
                });
            },

            fullFillShippingForm: function (addressType) {
                let self = this;
                if (self.checkoutData.address) {
                    let address = self.checkoutData.address;

                    if (addressType == 'billing') {
                        if(address.billing){
                            address = address.billing;
                        }
                    } else {
                        if (address.shipping) {
                            address = address.shipping;
                            self.isAddressFormVisible(true);
                        }
                    }

                    self.startLoader();

                    let setDataToShippingAddressFrom = setInterval(function () {
                        let form = $('#co-shipping-form');

                        if ($('#co-shipping-form input[name="firstname"]').length) {
                            $.each(self.addressFields, function (id,key) {
                                if (address[key]) {
                                    if (key == 'countryId' || key == 'regionId') {
                                        let name;
                                        if (key === 'countryId') name = 'country_id';
                                        if (key === 'regionId') name = 'region_id';
                                        let select = form.find('select[name="'+name+'"]');

                                        if (!select.hasClass('selectized')) {
                                            if(typeof select.selectize({})[0] != 'undefined'){
                                                select.selectize({})[0].selectize.refreshOptions(false);
                                            }
                                        } else {
                                            select.selectize({})[0].selectize.refreshOptions(false);
                                        }

                                        let control = select.closest('.field')
                                        control.find('.selectize-dropdown-content .option[data-value="'+address[key]+'"]').trigger('click');

                                        control.find('.selectize-dropdown-content .option[data-value="'+address[key]+'"]').trigger('click');
                                    }else if (key === 'street') {
                                        $.each(address[key], function (number,value) {
                                            if (form.find('input[name="street['+number+']"]').length) {
                                                let control = form.find('input[name="street['+number+']"]').closest('.control');

                                                if (!control.hasClass('focus')) {
                                                    control.addClass('focus');
                                                }

                                                form.find('input[name="street['+number+']"]').val(value).trigger('change');
                                            }
                                        })
                                    }else if (form.find('input[name="'+key+'"]').length) {
                                        let control = form.find('input[name="'+key+'"]').closest('.control');

                                        if (!control.hasClass('focus')) {
                                            control.addClass('focus');
                                        }

                                        form.find('input[name="'+key+'"]').val(address[key]).trigger('change');
                                    }else if (form.find('select[name="'+key+'"]').length) {
                                        if (form.find('select[name="'+key+'"] option[value="'+address[key]+'"]').length) {
                                            form.find('select[name="'+key+'"] option[value="'+address[key]+'"]').prop('selected',true);
                                        }
                                    }
                                }
                            })
                            clearInterval(setDataToShippingAddressFrom);
                            self.stopLoader(100);
                        }
                    },500);
                }
                self.source.set('params.invalid', false);
            },

            onAddressChange: function (addressId) {
                let self = this;
                self.startLoader();

                if (!$('#billing-address-same-as-shipping').prop('checked')) {
                    $('#billing-address-same-as-shipping').trigger('click');
                }

                if (addressId) {
                    $.each(self.checkoutData.addressList, function (key,address) {
                        if (addressId === address.customerAddressId) {
                            self.checkoutData.address.shipping = address;
                            self.fullFillShippingForm('shipping');
                        }
                    })
                }
                else {
                    self.startLoader();
                    let newShippingAddressInterval = setInterval(function () {
                        let newShippingAddress = $('#co-shipping-form');
                        if (newShippingAddress.length) {
                            if (newShippingAddress.find('select[name="country_id"]').length && newShippingAddress.find('select[name="region_id"]').length) {
                                newShippingAddress.validate().resetForm();
                                newShippingAddress.trigger("reset");
                                let country_id = newShippingAddress.find('select[name="country_id"]');
                                let region_id = newShippingAddress.find('select[name="region_id"]');
                                country_id.selectize({})[0].selectize.clear(true);
                                region_id.selectize({})[0].selectize.clear(true);
                                newShippingAddress.find('.control.focus').removeClass('focus');
                                clearInterval(newShippingAddressInterval);
                                self.stopLoader(100);
                            }
                        }
                    },500);
                }
                self.source.set('params.invalid', false);
                self.stopLoader(1000);
            },

            getAddressSameAsBillingFlag: function () {
                return this.isAddressSameAsBilling();
            },

            screenResize: function () {
                let self = this;

                window.addEventListener('resize', function (e) {
                    self.multiStepEventListener();
                });
            },

            multiStepEventListener: function () {
                let self = this,
                    screen = window.screen;

                if (screen.width > 991) {
                    self.updateMultiStepResolution(self.isDesktopMultiResolution());
                } else if (screen.width <= 991 & screen.width > 575) {
                    self.updateMultiStepResolution(self.isTabletMultiResolution());
                } else {
                    self.updateMultiStepResolution(self.isMobileMultiResolution());
                }
            },

            updateMultiStepResolution: function (resolution) {
                let self = this,
                    payment = self.checkoutData.payment;

                if (self.AddressStep()) {
                    self.CurrentStep(1);
                } else if (self.DeliveryStep()) {
                    self.CurrentStep(2);
                } else {
                    self.CurrentStep(3);
                }

                if (resolution == 'multistep') {
                    self.isMultiStepResolution(true);
                    payment.isMultiStepResolution(true);

                    if (self.CurrentStep() == 1) {
                        self.AddressStep(true);
                        self.DeliveryStep(false);
                        payment.PaymentStep(false);
                    } else if (self.CurrentStep() == 2) {
                        self.AddressStep(false);
                        self.DeliveryStep(true);
                        payment.PaymentStep(false);
                    } else {
                        self.AddressStep(false);
                        self.DeliveryStep(false);
                        payment.PaymentStep(true);
                    }

                } else {
                    self.isMultiStepResolution(false);
                    payment.isMultiStepResolution(false);
                    self.AddressStep(true);
                    self.DeliveryStep(true);
                    payment.PaymentStep(true);
                }

                return true;
            },

            isEmpty: function (value) {
                return (!value || value.length === 0);
            },

            autoFill: function () {
                let self = this;

                $(document).on('blur','input',function (){
                    if (!self.isEmpty($(this).val())) {
                        $(this).closest('.control').addClass('focus');
                    }
                });
            },

            initialize: function () {
                let self = this,
                    fieldsetName = 'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset';

                this._super().observe({
                    isAddressShippingFormVisible: false,
                    isAddressSameAsBilling: true,
                    isCommentVisible: true,
                    CurrentStep: ko.observable(1),
                    AddressStep: ko.observable(true),
                    DeliveryStep: ko.observable(false),
                    isMultiStepResolution: ko.observable(false),
                    isDesktopMultiResolution: ko.observable(false),
                    isTabletMultiResolution: ko.observable(false),
                    isMobileMultiResolution: ko.observable(false),
                    isShippingMethodActive: ko.observable(false),
                });

                this.checkoutData.shipping = this;

                let summary = self.checkoutData.summary;

                self.isDesktopMultiResolution(self.checkoutData.layout.desktop);
                self.isTabletMultiResolution(self.checkoutData.layout.tablet);
                self.isMobileMultiResolution(self.checkoutData.layout.mobile);

                self.AddressStep.subscribe(function (AddressStep) {
                    summary.updateSummaryWrapperTopHeight(0);
                });

                self.DeliveryStep.subscribe(function (DeliveryStep) {
                    summary.updateSummaryWrapperTopHeight(0);
                });

                instance = this;

                shippingRatesValidator.initFields(fieldsetName);
                checkoutDataResolver.resolveShippingAddress();
                registry.async('checkoutProvider')(function (checkoutProvider) {
                    var shippingAddressData = checkoutData.getShippingAddressFromData();
                    if (shippingAddressData) {
                        checkoutProvider.set(
                            'shippingAddress',
                            $.extend({}, checkoutProvider.get('shippingAddress'), shippingAddressData)
                        );
                    }

                    checkoutProvider.on('shippingAddress', function (shippingAddressData) {
                        checkoutData.setShippingAddressFromData(shippingAddressData);
                    });
                });

                totalsProcessors['default'] = totalsDefaultProvider;

                if (addressList().length !== 0) {
                    self.checkoutData.addressList = addressList();
                    this.selectedAddress.subscribe(function (addressId) {
                        if (typeof addressId === 'undefined' || addressId === '') { addressId = null; }
                        var address = _.filter(self.addressOptions, function (address) {
                            return address.customerAddressId === addressId;
                        })[0];
                        self.isAddressFormVisible(address === newAddressOption);
                        if (address && address.customerAddressId) {
                            self.checkoutData.address.shipping = address;

                            if (quote.shippingAddress() && quote.shippingAddress().getKey() === address.getKey()) {
                                return;
                            }

                            selectShippingAddress(address);
                            checkoutData.setSelectedShippingAddress(address.getKey());
                        } else {
                            var addressData,
                                newShippingAddress;
                            addressData = self.source.get('shippingAddress');
                            addressData.save_in_address_book = self.saveInAddressBook ? 1 : 0;
                            newShippingAddress = addressConverter.formAddressDataToQuoteAddress(addressData);
                            selectShippingAddress(newShippingAddress);
                            checkoutData.setSelectedShippingAddress(newShippingAddress.getKey());
                            checkoutData.setNewCustomerShippingAddress(addressData);
                        }
                    });

                    if (quote.shippingAddress()) {
                        this.selectedAddress(quote.shippingAddress().customerAddressId);
                    }
                }

                this.commentValue.subscribe(function (value) {
                    checkoutData.setComment(value);
                });

                quote.shippingMethod.subscribe(function (shippingMethod) {
                    clearTimeout(setShippingInformationTimeout);
                    if (shippingMethod) {
                        var carrierTitle = self.formatCarrierTitle(shippingMethod);
                        self.shippingRateGroup(carrierTitle);
                        self.shippingRate(shippingMethod.carrier_code + '_' + shippingMethod.method_code);
                    } else {
                        self.shippingRateGroup('');
                        self.shippingRate('');
                    }

                    clearTimeout(setShippingInformationTimeout);
                    clearTimeout(getTotalsTimeout);
                    if (shippingMethod) {
                        setShippingInformationTimeout = setTimeout(function () {
                            clearTimeout(getTotalsTimeout);
                            self.setShippingInformation();
                        }, 400);
                    } else {
                        getTotalsTimeout = setTimeout(function () {
                            clearTimeout(setShippingInformationTimeout);
                            var type = quote.shippingAddress().getType();
                            totalsProcessors[type]
                                ? totalsProcessors[type].estimateTotals(quote.shippingAddress())
                                : totalsProcessors['default'].estimateTotals(quote.shippingAddress());
                        }, 400);
                    }
                    self.validateShippingInformation();
                });

                this.rates.subscribe(function (rates) {
                    self.rateBuilding(true);
                    self.shippingRateGroups([]);
                    if (rates.length > 1) {
                        self.shippingRateGroupsCaption('');
                    } else {
                        self.shippingRateGroupsCaption(null);
                    }

                    _.each(rates, function (rate) {
                        if (rate) {
                            var carrierTitle = self.formatCarrierTitle(rate);
                            if (rate.error_message || !rate.method_code) {
                                self.rates.remove(rate);
                            }

                            if (self.shippingRateGroups.indexOf(carrierTitle) === -1) {
                                self.shippingRateGroups.push(carrierTitle);
                            }
                        }
                    });
                    self.rateBuilding(false);
                });

                this.shippingRateGroup.subscribe(function (carrierTitle) {
                    if (carrierTitle === '') {
                        return;
                    }

                    self.shippingRates([]);
                    var ratesByGroup = _.filter(self.rates(), function (rate) {
                        return carrierTitle === self.formatCarrierTitle(rate);
                    });

                    if (ratesByGroup.length === 0) {
                        self.selectShippingMethod('');
                    }

                    if (ratesByGroup.length > 1) {
                        self.shippingRatesCaption('');
                    } else {
                        self.shippingRatesCaption(null);
                    }

                    var $selectize = $('#iwd_opc_shipping_method_rates');

                    $selectize = $selectize.length
                        ? $selectize[0].selectize
                        : false;

                    if ($selectize) {
                        $selectize.loadedSearches = {};
                        $selectize.userOptions = {};
                        $selectize.renderCache = {};
                        $selectize.options = $selectize.sifter.items = {};
                        $selectize.lastQuery = null;
                        $selectize.updateOriginalInput({silent: true});
                    }

                    _.each(ratesByGroup, function (rate) {
                        if (self.shippingRates.indexOf(rate) === -1) {
                            rate = self.formatShippingRatePrice(rate);
                            self.shippingRates.push(rate);

                            if (rate.available && $selectize) {
                                $selectize.addOption({text: self.shippingRateTitle(rate), value: rate.carrier_code + '_' + rate.method_code})
                            }
                        }
                    });

                    if ($selectize) {
                        $selectize.refreshOptions(false);
                        $selectize.refreshItems();

                        if (ratesByGroup.length) {
                            $selectize.addItem(ratesByGroup[0].carrier_code + '_' + ratesByGroup[0].method_code);
                        }
                    }
                });

                this.shippingRates.subscribe(function (rate) {
                    var minLength = (self.displayAllMethods) ? 1 : 0;

                    if (self.shippingRates().length > minLength) {
                        self.isShippingRatesVisible(true);
                    } else {
                        self.isShippingRatesVisible(false);
                    }
                });

                self.multiStepEventListener();
                self.screenResize();
                self.initCheckoutData();
                if (!self.isShippingMethodActive()) {
                    self.initShippingMethod();
                }
                self.changeShippingMethod();
                self.autoFill();

                return this;
            },

            initCheckoutData:function(){
                if(typeof this.checkoutData != 'object'){
                    this.checkoutData = {}
                }
            },

            isShippingFormFirst: function() {
                if (this.getAddressTypeOrder() == 'shipping_first') {
                    return true;
                }

                return false;
            },

            getAddressTypeOrder: function(){
                if (quote.isVirtual()) {
                    return 'billing_first';
                }

                if(this.checkoutData){
                    if(this.checkoutData.address_type_order && this.checkoutData.address_type_order == 'billing_first'){
                        return 'billing_first';
                    }
                }
                return 'shipping_first';
            },

            getDesignResolution: function(design){
                return this.checkoutData.layout.design;
            },

            setDesignResolution: function() {
                if (this.checkoutData.layout.desktop == 'multistep') {
                    this.DeliveryStep(false);
                    this.checkoutData.payment.PaymentStep(false);
                    this.isMultiStepResolution(true);
                    this.checkoutData.payment.isMultiStepResolution(true);
                } else {
                    this.DeliveryStep(true);
                    this.checkoutData.payment.PaymentStep(true);
                    this.isMultiStepResolution(false);
                    this.checkoutData.payment.isMultiStepResolution(false);
                }

                var shippingAddressFromData = setInterval(function () {
                    if ($('#co-shipping-form input[name="firstname"]').length) {
                        if(this.checkoutData.shippingAddressFromData) {
                            $.each(this.checkoutData.shippingAddressFromData,function (key,value) {
                                if(key == 'street') {
                                    $.each(value,function (number,address) {
                                        if(address && address.length){
                                            if($('#co-shipping-form input[name="street['+number +']"]').length){
                                                $('#co-shipping-form input[name="street['+number +']"]').closest('.control').addClass('focus');
                                            }
                                        }
                                    });
                                }else if(value && value.length){
                                    if($('#co-shipping-form input[name="'+key+'"]').length){
                                        $('input[name="'+key+'"]').closest('.control').addClass('focus');
                                    }
                                }
                            });

                            clearInterval(shippingAddressFromData);
                        }
                    }
                }, 500);

                setTimeout(function () {
                    clearInterval(shippingAddressFromData);
                },5000)

                if(this.checkoutData.billingAddressFormData){

                }

                return true;
            },

            isShippingFormFirst: function() {
                let self = this;

                self.initShippingMethod();

                if (self.getAddressTypeOrder() == 'shipping_first') {
                    return true;
                }

                return false;
            },

            isBillingFormFirst: function() {
                if (this.isShippingFormFirst()) {
                    return false;
                }

                this.decorateBillingSelect();

                return true;
            },

            decorateBillingSelect:function(){
                var decorateBillingSelect = setInterval(function () {
                    var region_id = $('#billing-new-address-form select[name="region_id"]'),
                        country_id = $('#billing-new-address-form select[name="country_id"]');

                    if (region_id.length) {
                        region_id.serialize({});
                    }

                    if (country_id.length) {
                        country_id.serialize({});
                    }

                    if (region_id.length && country_id.length) {
                        clearInterval(decorateBillingSelect);
                    }
                }, 500);
            },

            startLoader: function(){
                fullScreenLoader.startLoader();
            },

            stopLoader: function(timeout = 2000){
                setTimeout(function () {
                    fullScreenLoader.stopLoader();
                },timeout)
            },

            changeShippingMethod:function(){
                let self = this;

                $(document).on('click',self.shippingMethod,function (event) {
                    self.startLoader();
                    $(self.shippingMethod).removeClass('_active');
                    $(this).addClass('_active');
                    $(self.shippingMethod).find('input[type="radio"]').prop('checked',false);

                    let shippingMethod = $(this).find('input[type="radio"]');
                    shippingMethod.prop('checked',true);

                    if(self.checkoutData.shippingMethodCode && self.checkoutData.shippingMethodCode === shippingMethod.val()){
                        self.stopLoader();
                        return false;
                    }
                    else{
                        self.selectCurrentShippingMethod(shippingMethod.attr('name'));
                        self.stopLoader();
                    }
                })
            },

            selectCurrentShippingMethod: function(name){
                let self = this;

                self.checkoutData.shippingMethodCode = $('input[name="'+name+'"]').val();
                $('input[name="'+name+'"]').click();
            },

            initShippingMethod: function(){
                let self = this;

                if (self.isShippingMethodActive()) {
                    return true;
                } else {
                    self.isShippingMethodActive(true);
                }

                let initShippingMethod = setInterval(function () {
                    if($(self.shippingMethod).length){
                        let shipping = self.checkoutData.default.shipping;
                        let shippingMethod = $(self.shippingMethod).eq(0).find('input[type="radio"]');
                        if(shipping){
                            shippingMethod = $(self.shippingMethod).find('input[value="'+shipping+'"]');
                        }
                        if (shippingMethod.length) {
                            shippingMethod.trigger('click');
                        }
                        clearInterval(initShippingMethod);
                    }
                },500);
                setTimeout(function () {
                    clearInterval(initShippingMethod);
                },5000)
            },

            optionsRenderCallback: [],

            decorateSelect: function (uid) {
                if (typeof(this.optionsRenderCallback[uid]) !== 'undefined') {
                    clearTimeout(this.optionsRenderCallback[uid]);
                }

                this.optionsRenderCallback[uid] = setTimeout(function () {
                    var select = $('#' + uid);
                    if (select.length) {
                        select.decorateSelectCustom();
                    }
                }, 0);
            },

            formatShippingRatePrice: function (rate) {
                if (rate.price_excl_tax !== 0 && rate.price_incl_tax !== 0) {
                    if (window.checkoutConfig.isDisplayShippingBothPrices && (rate.price_excl_tax !== rate.price_incl_tax)) {
                        rate.formatted_price = priceUtils.formatPrice(rate.price_excl_tax, quote.getPriceFormat());
                        rate.formatted_price += ' (' + $t('Incl. Tax') + ' ' + priceUtils.formatPrice(rate.price_incl_tax, quote.getPriceFormat()) + ')';
                    } else {
                        if (window.checkoutConfig.isDisplayShippingPriceExclTax) {
                            rate.formatted_price = priceUtils.formatPrice(rate.price_excl_tax, quote.getPriceFormat());
                        } else {
                            rate.formatted_price = priceUtils.formatPrice(rate.price_incl_tax, quote.getPriceFormat());
                        }
                    }
                }

                return rate;
            },

            setShippingInformation: function () {
                var shippingAddress = quote.shippingAddress();
                var billingAddress = quote.billingAddress(),
                    amazonAccountLoggedIn = false;

                if(amazonPayEnabled) {
                    if(amazonStorage.isAmazonAccountLoggedIn()) {
                        amazonAccountLoggedIn = true;
                    }
                }

                if(!amazonAccountLoggedIn){
                    if (this.isAddressFormVisible()) {
                        var shippingAddress,
                            addressData;
                        addressData = addressConverter.formAddressDataToQuoteAddress(
                            this.source.get('shippingAddress')
                        );

                        for (var field in addressData) {
                            if (addressData.hasOwnProperty(field) &&
                                shippingAddress.hasOwnProperty(field) &&
                                typeof addressData[field] !== 'function' &&
                                _.isEqual(shippingAddress[field], addressData[field])
                            ) {
                                shippingAddress[field] = addressData[field];
                            } else if (typeof addressData[field] !== 'function' &&
                                !_.isEqual(shippingAddress[field], addressData[field])) {
                                shippingAddress = addressData;
                                break;
                            }
                        }

                        if (customer.isLoggedIn()) {
                            shippingAddress.save_in_address_book = this.saveInAddressBook ? 1 : 0;
                        }

                        checkoutData.setNeedEstimateShippingRates(false);
                        selectShippingAddress(shippingAddress);
                        if (customer.isLoggedIn()) {
                            checkoutData.setNewCustomerShippingAddress(shippingAddress);
                        }

                        checkoutData.setNeedEstimateShippingRates(true);
                    }
                } else {
                    if(!customer.isLoggedIn()) {
                        shippingAddress.save_in_address_book = 1;
                        billingAddress.save_in_address_book = 1;
                    }
                }

                if (quote.shippingMethod()) {
                    paymentIsLoading.isLoading(true);
                    return setShippingInformationAction().always(function () {
                        paymentIsLoading.isLoading(false);
                    });
                } else {
                    return $.Deferred();
                }
            },

            textareaAutoSize: function (element) {
                $(element).textareaAutoSize();
            },

            shippingRateTitle: function (rate) {
                var title = '';
                if (rate) {
                    if (rate.formatted_price) {
                        title += rate.formatted_price + ' - ';
                    }
                }

                title += rate.method_title;

                return title;
            },

            shippingRateTitleFull: function(rate) {
                var title = this.shippingRateTitle(rate);
                if (rate.carrier_title) {
                    title += ': ' + rate.carrier_title;
                }

                return title;
            },

            formatCarrierTitle: function (rate) {
                var carrierTitle = rate['carrier_title'];

                if (this.displayAllMethods && this.specificMethodsForDisplayAllMethods.indexOf(rate.carrier_code)) {
                    rate = this.formatShippingRatePrice(rate);
                    carrierTitle = this.shippingRateTitleFull(rate);
                }

                return carrierTitle
            },

            addressOptionsText: function (address) {
                return address.getAddressInline();
            },

            selectShippingMethod: function (shippingMethod, shippingRates) {
                selectShippingMethodAction(shippingMethod);
                checkoutData.setSelectedShippingRate(shippingMethod['carrier_code'] + '_' + shippingMethod['method_code']);
                return true;
            },

            validateShippingInformation: function (showErrors) {
                var loginFormSelector = 'form[data-role=email-with-possible-login]',
                    self = this,
                    emailValidationResult = customer.isLoggedIn(),
                    shippingMethodValidationResult = true;

                if(amazonPayEnabled) {
                    if (amazonStorage.isAmazonAccountLoggedIn()) {
                        if(!customer.isLoggedIn() && $(loginFormSelector).length) {
                            $(loginFormSelector).validation();
                            return Boolean($(loginFormSelector + ' input[name=username]').valid());
                        } else {
                            return true;
                        }
                    }
                }

                showErrors = showErrors || false;
                var shippingMethodForm = $('#co-shipping-method-form'),
                    shippingMethodSelectors = shippingMethodForm.find('.select');
                shippingMethodSelectors.removeClass('mage-error');
                shippingMethodForm.validate({
                    errorClass: 'mage-error',
                    errorElement: 'div',
                    meta: 'validate'
                });
                shippingMethodForm.validation();
                //additional validation for non-selected shippingMethod
                if(showErrors && !quote.shippingMethod()) {
                    shippingMethodSelectors.addClass('mage-error');
                }

                if (!shippingMethodForm.validation('isValid') || !quote.shippingMethod()) {
                    if (!showErrors && this.canHideErrors && shippingMethodForm.length) {
                        shippingMethodForm.validate().resetForm();
                    }

                    shippingMethodValidationResult = false;
                }

                if (!customer.isLoggedIn() && $(loginFormSelector).length) {
                    $(loginFormSelector).validation();
                    emailValidationResult = Boolean($(loginFormSelector + ' input[name=username]').valid());
                    if (!showErrors && this.canHideErrors) {
                        $(loginFormSelector).validate().resetForm();
                    }
                }

                if (this.isAddressFormVisible()) {
                    this.source.set('params.invalid', false);
                    this.source.trigger('shippingAddress.data.validate');

                    if (this.source.get('shippingAddress.custom_attributes')) {
                        this.source.trigger('shippingAddress.custom_attributes.data.validate');
                    }

                    if (this.source.get('params.invalid') ||
                        !quote.shippingMethod() ||
                        !emailValidationResult ||
                        !shippingMethodValidationResult
                    ) {
                        if (!showErrors && this.canHideErrors) {
                            var shippingAddress = this.source.get('shippingAddress');
                            shippingAddress = _.extend({
                                region_id: '',
                                region_id_input: '',
                                region: ''
                            }, shippingAddress);
                            _.each(shippingAddress, function (value, index) {
                                self.hideErrorForElement(value, index);
                            });
                            this.source.set('params.invalid', false)
                        }

                        return false;
                    }
                }

                return emailValidationResult && shippingMethodValidationResult;
            },
            hideErrorForElement: function (value, index) {
                var self = this;
                if (typeof(value) === 'object') {
                    _.each(value, function (childValue, childIndex) {
                        var newIndex = (index === 'custom_attributes' ? childIndex : index + '.' + childIndex);
                        self.hideErrorForElement(childValue, newIndex);
                    })
                }

                var fieldObj = registry.get('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.' + index);
                if (fieldObj) {
                    if (typeof (fieldObj.error) === 'function') {
                        fieldObj.error(false);
                    }
                }
            }
        });
    }
);
