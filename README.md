# Setup

### Install magento 2.4.5 through softaculous
### Clone this repo and replace source in public_html
### php bin/magento module:disable Magento_TwoFactorAuth
### php bin/magento setup:upgrade
## Admin setting:
### Content/Configuration => change theme to Porto, upload Icon 80x80
### Porto/Setting/Activate Theme: add this: 3a869e2d-bcd6-4f93-939a-d6987dc3b277
### Porto/Settings
-   General: Maximum page => Full Width
-   Header: Header type => Type 12
-   Category View: Image width/height => 350x350, Show Rating stars => No, Page Layout => 1 Column, Category Description Position => As Full Width below the Header, Custom Block Id for Sidebar => empty
-   Category View: Products Grid Type => Type3, Products Grid Columns => 4 columns
-   Newsletter Popup: Enabled => Disabled
-   Installation: Demo Version => Demo12, click import static block and import cms pages.
### Porto/Settings/General:
-   Update Country to Vietnam, Update Locale to Vietnam, Update weight unit.
-   Update Currency Setup to Vietnam dong.
### Content/Block:
-   Remove Porto - Custom Menu(before) and Porto - Custom Menu(after)
### Content/Page;
-   Replace code of Home page with this code {{block class="Smartwave\Porto\Block\Template" template="homepage.phtml"}}

=> flush cache.
