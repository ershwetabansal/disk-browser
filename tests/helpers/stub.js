
function setUpHTMLFixture() {
    $('body').empty();

	document.body.innerHTML = '<div id="disk-browser"><div class="modal fade file-manager" id="FileBrowser" tabindex="-1" role="dialog"> ' +
        '<nav id="file-context-menu" class="context-menu hidden"> ' +
        '<ul class="list-unstyled"> ' +
        '<li><a href="#" id="view-file"><i class="fa fa-eye"></i> View</a></li> ' +
        '<li><a href="#" id="rename-file"><i class="fa fa-edit"></i> Rename</a></li> ' +
        '<li><a href="#" id="remove-file"><i class="fa fa-trash"></i> Remove</a></li> ' +
        '<li><a href="#" id="download-file"><i class="fa fa-download"></i> Download</a></li> ' +
        '</ul> ' +
        '</nav> ' +
        '<div class="modal-dialog modal-lg" role="document"> ' +
        '<div class="modal-content"> ' +
        '<div class="modal-header"> ' +
        '<h4 class="modal-title pull-left" id="myModalLabel">File Manager ' +
        '<i id="loading_bar" class="fa fa-spinner fa-spin hidden"></i> ' +
        '</h4> ' +
        '<div id="error_message" class="text-center error"></div> ' +
        '</div> ' +
        '<div class="modal-body"> ' +
        '<div class="form-inline" role="toolbar" aria-label="..."> ' +
        '<div class="form-group" role="group" aria-label="..."> ' +
        '<select id="disk_selector" class="form-control"> ' +
        '</select> ' +
        '<button class="btn btn-default" id="fb_create_new_directory">New Folder</button> ' +
        '<button class="btn btn-default" id="upload_file_btn"><i class="fa fa-upload" aria-hidden="true"></i></button> ' +
        '<button class="btn btn-default hidden desc" id="fb_file_manage">Manage &nbsp;<span class="caret"></span></button> ' +
        '</div> ' +
        '<div class="form-group pull-right"> ' +
        '<div class="btn-group" role="group" aria-label="..."> ' +
        '<button id="fb_refresh" class="btn btn-default" ><i class="fa fa-refresh"></i></button> ' +
        '<button id="fb_align_list" class="btn btn-default" ><i class="fa fa-bars"></i></button> ' +
        '<button id="fb_align_grid" class="btn btn-default" ><i class="fa fa-th"></i></button> ' +
        '</div> ' +
        '<select id="fb_sort_files" class="form-control" > ' +
        '<option value="">Sort by</option> ' +
        '</select> ' +
        '<div class="input-group"> ' +
        '<input id="fb_search_input" type="text" class="form-control" id="filter" placeholder="Filter" /> ' +
        '<i id="fb_search_cancel" class="fa fa-times hidden"></i> ' +
        '<div id="fb_search_submit" type="submit" role="button" class="input-group-addon"> ' +
        '<i class="fa fa-search"></i> ' +
        '</div> ' +
        '</div> ' +
        '</div> ' +
        '</div> ' +
        '<div class="row"> ' +
        '<div class="col-md-3 col-xs-3 directories"> ' +
        '<ul class="list-unstyled" id="directories-list"> ' +
        '</ul> ' +
        '</div> ' +
        '<div class="col-md-9 col-xs-9 files"> ' +
        '<div id="remove-file-box" class="popup form-inline hidden"> ' +
        '<div class="align-center">' +
        'Are you sure you want to delete the file? ' +
        '</div> ' +
        '<div class="align-center move-down"> ' +
        '<button id="remove-file-ok" class="btn btn-primary">Ok</button> ' +
        '<button id="remove-file-close" class="btn btn-default">Cancel</button> ' +
        '</div> ' +
        '</div> ' +
        '<div id="rename-file-box" class="popup form-inline hidden"> ' +
        '<div class="form-group"> ' +
        '<label for="file-name" class="label-control">File Name:</label> ' +
        '<input placeholder="File Name" id="rename-file-name" class="form-control"/> ' +
        '</div> ' +
        '<div class="align-center move-down"> ' +
        '<button id="rename-file-ok" class="btn btn-primary">Ok</button> ' +
        '<button id="rename-file-close" class="btn btn-default">Close</button> ' +
        '</div> ' +
        '</div> ' +
        '<ul id="fb_file_search_options" class="list-inline hidden"></ul> ' +
        '<div> ' +
        '<form id="file_browser_upload" class="form-inline hidden"> ' +
        '<div class="form-group"> ' +
        '<input id="upload_file" name="file" type="file" class="form-control" required/> ' +
        '</div> ' +
        '<div id="upload_file_parameters" class="form-group"> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<button id="upload_file_to_Server" type="button" class="btn btn-primary">Upload</button> ' +
        '<button id="cancel_file_upload" type="button" class="btn btn-default">Cancel</button> ' +
        '</div> ' +
        '</form> ' +
        '<div class="text-center hidden" id="upload_file_loading"><i class="fa fa-spinner fa-spin fa-2x"></i></div> ' +
        '</div> ' +
        '<table id="files-list" class="table hidden"></table> ' +
        '<ul id="files-grid" class="list-unstyled hidden"></ul> ' +
        '</div> ' +
        '</div> ' +
        '</div> ' +
        '<div class="modal-footer"> ' +
        '<ul id="show-file-details" class="list-inline hidden"></ul> ' +
        '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button> ' +
        '<button type="button" class="btn btn-primary hidden" id="fb-primary-btn"></button> ' +
        '</div> ' +
        '</div> ' +
        '</div> </div></div>' +
        '<input id="path_input_box"/>';
}

function keyPress(key) {
  var event = document.createEvent('Event');
  event.keyCode = key;
  event.initEvent('keydown');
  document.dispatchEvent(event);
}

function getDiskData() {
	return [
       {
           name: 'Images',
           label: 'Image Folder',
           absolute_path: false,
       },
       {
           name: 'S3',
           label: 'AWS S3',
           absolute_path: false,
       }
    ];
}

function getDirectoryData(disk) {

    disk = disk || 'images';

    if (disk == 'images') {
        return [
            {
                name: 'cats',
                path: '/'
            },
            {
                name: 'dogs',
                path: '/'
            },
            {
                name: 'monkeys',
                path: '/'
            }
        ];
    } else if (disk == 'documents') {
        return [
            {
                name: '2016',
                path: '/'
            },
            {
                name: '2015',
                path: '/'
            }
        ];

    } else {
        return [];
    }
}

function getSubDirectoryData(directory, disk) {
    disk = disk || 'images';

    var directoryStructure;

    if (disk == 'images') {

        directoryStructure = {
            cats: [
                {
                    name: 'cute',
                    path: '/cats/'
                },
                {
                    name: 'angry',
                    path: '/cats/'
                }
            ],
            dogs: [],
            monkeys: [],
            'cats/cute' : [],
            'cats/angry' : []
        };
    } else if (disk == 'documents') {
        directoryStructure = {
            '2016': [
                {
                    name : '01',
                    path : '/2016/'
                },
                {
                    name : '02',
                    path : '/2016/'
                },
                {
                    name : '03',
                    path : '/2016/'
                },
                {
                    name : '04',
                    path : '/2016/'
                },
                {
                    name : '05',
                    path : '/2016/'
                }
            ],
            '2015': [
                {
                    name : '01',
                    path : '/2015/'
                },
                {
                    name : '02',
                    path : '/2015/'
                },
                {
                    name : '03',
                    path : '/2015/'
                },
                {
                    name : '04',
                    path : '/2015/'
                },
                {
                    name : '05',
                    path : '/2015/'
                },
                {
                    name : '06',
                    path : '/2015/'
                },
                {
                    name : '07',
                    path : '/2015/'
                },
                {
                    name : '08',
                    path : '/2015/'
                },
                {
                    name : '09',
                    path : '/2015/'
                },
                {
                    name : '10',
                    path : '/2015/'
                },
                {
                    name : '11',
                    path : '/2015/'
                },
                {
                    name : '12',
                    path : '/2015/'
                }
            ]
        };

    }

    return directoryStructure[directory] || [];
}

function getFilesData(directory, disk) {
    disk = disk || 'images';
    var files;

    if (disk == 'images') {
        files = {
            cats : [
                {
                    name: 'Black Cat.jpg',
                    path: '/cats/',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                },
                {
                    name: 'Kitten.jpg',
                    path: '/cats/',
                    size: 20,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                },
                {
                    name: 'Fat Cat.jpg',
                    path: '/cats/',
                    size: 100,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                },
                {
                    name: 'Cat like dog.jpg',
                    path: '/cats/',
                    size: 20,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                }
            ],
            dogs : [
                {
                    name: 'Black dog.jpg',
                    path: '/dog/',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                },
                {
                    name: 'White dog.jpg',
                    path: '/dog/',
                    size: 20,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                },
                {
                    name: 'special breed.jpg',
                    path: '/dog/',
                    size: 20,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                }
            ],
            monkeys : [

            ],
            '--root--' : [
                {
                    name: 'dogs_cats_monkeys.jpg',
                    path: '/',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                }
            ]
        };
    } else if (disk == 'documents') {
        files = {
            2016 : [],
            2015 : [],
            '--root--' : [],
            '2016/01' : [
                {
                    name: '2016_01_01.docx',
                    path: '/',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'docx'
                },
                {
                    name: '2016_01_02.docx',
                    path: '/',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'docx'
                }
            ],
            '2016/02' : [
                {
                    name: '2016_02_01.docx',
                    path: '/',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'docx'
                }
            ],
            '2015/01' : [
                {
                    name: '2015_01_01.docx',
                    path: '/',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'docx'
                }
            ],
            '2015/02' : [
                {
                    name: '2015_02_01.docx',
                    path: '/',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'docx'
                }
            ],
            '2015/03' : [
                {
                    name: '2015_03_01.docx',
                    path: '/',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'docx'
                }
            ]

        };

    }

    return files[directory] || [];
}

function getUploadedFile() {
    return {
        name: 'new_dog.jpg',
        path: '/dog/',
        size: 50,
        last_modified_date: '2015-01-01 00:00',
        type: 'jpg'
    }
}

function getSearchResults() {
    return {
        files: [
            {
                name: 'Black dog.jpg',
                path: '/dog/',
                size: 50,
                last_modified_date: '2015-01-01 00:00',
                type: 'jpg'
            },
            {
                name: 'White dog.jpg',
                path: '/dog/',
                size: 20,
                last_modified_date: '2015-01-01 00:00',
                type: 'jpg'
            },
            {
                name: 'Cat like dog.jpg',
                path: '/cats/',
                size: 20,
                last_modified_date: '2015-01-01 00:00',
                type: 'jpg'
            }
        ]
    };
}
function getSetupObject() {
	return {

        disks : {
            search : true,
            search_URL: 'http://file-browser.com/api/v1/disk/search',
            details : [
                {
                    //In case of cross origin disk
                    name: 'images',
                    label: 'Images',
                    path : {
                        relative : true
                    }
                },
                {
                    //In case of cross origin disk
                    name: 'documents',
                    label: 'Documents',
                    path : {
                        relative : true
                    }
                }
            ]
        },
        directories: {
            list: 'http://file-browser.com/api/v1/directories',
            create: 'http://file-browser.com/api/v1/directory/store',
            delete: '/api/v1/directory/destroy'
        },
        files: {
            list: 'http://file-browser.com/api/v1/files',
            upload: {
                url: 'http://file-browser.com/api/v1/file/store',
                params:[]
            },
            thumbnail: {
                show : true,
                directory : '/thumbnails',
                path : '',
                prefix : '',
                suffix : ''
            },
            size_unit : 'KB'
        },
        http : {
            headers : {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            error : function(status, response) {
                if (status == '422') {
                    for (var key in response) {
                        return response[key][0];
                    }
                }
                return 'Error encountered. ';
            }
        },
        authentication : "session"
    };
}

module.exports = {
	setUpHTMLFixture : setUpHTMLFixture,
	keyPress : keyPress,
	getDiskData : getDiskData,
	getDirectoryData : getDirectoryData,
    getSubDirectoryData : getSubDirectoryData,
    getFilesData : getFilesData,
	getSetupObject : getSetupObject,
    getSearchResults : getSearchResults,
    getUploadedFile : getUploadedFile
};