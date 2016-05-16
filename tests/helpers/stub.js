
function setUpHTMLFixture() {
	document.body.innerHTML = '<div class="modal fade file-manager" id="FileBrowser" tabindex="-1" role="dialog"> ' +
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
        '</div> </div>';
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

function getDirectoryData() {
	return [
        {
            name: 'cats'
        },
        {
            name: 'dogs'
        },
        {
            name: 'monkeys'
        }
    ];
}

function getSubDirectoryData() {
    return [
                        {name: '01'},
                        {name: '02'},
                        {name: '03'},
                        {name: '04'},
                        {name: '05'},
                        {name: '06'},
                        {name: '07'},
                        {name: '08'},
                        {name: '09'},
                        {name: '10'}
                    ];
}

function getFilesData() {
    return [
                {
                    name: 'Black Cat.jpg',
                    path: 'https://www.petfinder.com/wp-content/uploads/2013/09/cat-black-superstitious-fcs-cat-myths-162286659.jpg',
                    size: 50,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                },
                {
                    name: 'Kitten.jpg',
                    path: 'http://www.medhatspca.ca/sites/default/files/news_photos/2014-Apr-15/node-147/cute-little-cat.jpg',
                    size: 20,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                },
                {
                    name: 'Fat Cat.jpg',
                    path: 'http://images.thesurge.com/app/uploads/2015/12/cat-.jpg?1bccdf',
                    size: 100,
                    last_modified_date: '2015-01-01 00:00',
                    type: 'jpg'
                }
            ];
}

function getSetupObject() {
	return {
		disks : {
            search_URL : '/asset/file/search',
	        search : true,
	        details : [
	         {
	             name: 'Images',
	             label: 'Image Folder',
	             absolute_path: false
	         },
	         {
	             name: 'S3',
	             label: 'AWS S3',
	             absolute_path: false
	         }
	      ]
	    },
	    directories: {
	       list: '/asset/directories',
	       destroy: '/asset/directories/destroy',
	       create: '/asset/directories/store',
	       update: '/asset/directories/update'
	    },
	    files: {
	       list: '/asset/files',
	       destroy: '/asset/file/destroy',
	       upload: { 
	            url : '/asset/file/store', 
	            params : [
	                {name : 'Name', label : 'File Name' , 'type' : 'text'}
	            ]},
	       update: '/asset/file/store',
	       unit: 'kb'
	    }
	};
}

module.exports = {
	setUpHTMLFixture : setUpHTMLFixture,
	keyPress : keyPress,
	getDiskData : getDiskData,
	getDirectoryData : getDirectoryData,
    getSubDirectoryData : getSubDirectoryData,
    getFilesData : getFilesData,
	getSetupObject : getSetupObject
}