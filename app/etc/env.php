<?php
return [
    'backend' => [
        'frontName' => 'admin4IxgH6'
    ],
    'remote_storage' => [
        'driver' => 'file'
    ],
    'queue' => [
        'consumers_wait_for_messages' => 1
    ],
    'crypt' => [
        'key' => 'yzxclff1fhpthqf5ivsgvsapqnq2v7re'
    ],
    'db' => [
        'table_prefix' => 'o2s_',
        'connection' => [
            'default' => [
                'host' => 'localhost',
                'dbname' => 'icilsxvh_o2s',
                'username' => 'icilsxvh_o2s',
                'password' => ']b.M-(7)-gZCp7Opq]S8',
                'model' => 'mysql4',
                'engine' => 'innodb',
                'initStatements' => 'SET NAMES utf8;',
                'active' => '1',
                'driver_options' => [
                    1014 => false
                ]
            ]
        ]
    ],
    'resource' => [
        'default_setup' => [
            'connection' => 'default'
        ]
    ],
    'x-frame-options' => 'SAMEORIGIN',
    'MAGE_MODE' => 'default',
    'session' => [
        'save' => 'db'
    ],
    'cache' => [
        'frontend' => [
            'default' => [
                'id_prefix' => 'c59_'
            ],
            'page_cache' => [
                'id_prefix' => 'c59_'
            ]
        ],
        'allow_parallel_generation' => false
    ],
    'lock' => [
        'provider' => 'db'
    ],
    'directories' => [
        'document_root_is_pub' => true
    ],
    'cache_types' => [
        'config' => 1,
        'layout' => 1,
        'block_html' => 1,
        'collections' => 1,
        'reflection' => 1,
        'db_ddl' => 1,
        'compiled_config' => 1,
        'eav' => 1,
        'customer_notification' => 1,
        'config_integration' => 1,
        'config_integration_api' => 1,
        'full_page' => 1,
        'config_webservice' => 1,
        'translate' => 1
    ],
    'downloadable_domains' => [
        'o2sconcept.com'
    ],
    'install' => [
        'date' => 'Fri, 03 Mar 2023 12:41:22 +0700'
    ]
];
