(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Manager = require('./manager.js');
var element = require('../helpers/element.js');

var manager;
function browserSetup(setupObject) {
	manager = new Manager(setupObject);

    if (manager.validateSetupObject()) {
        manager.doInitialSetup();
    }
}

function openBrowser(modalBoxParams) {
	if (manager.validateSetupObject()) {
		element.openModal(modalBoxParams.resize);
		manager.load(modalBoxParams);
	} else {
		alert("Please check consoler errors.");
	}
}

function Browser(){
	return { 
		setup : browserSetup,
		openBrowser : openBrowser
	};
}

window.FileBrowser = function() {
	return {
		getInstance : function() {
			return new Browser();
		}
	}
};
},{"../helpers/element.js":5,"./manager.js":2}],2:[function(require,module,exports){
//Static funcions
var validate = require('../helpers/validate.js');
var eventHandler = require('../handlers/eventHandler.js');
var requestHandler = require('../handlers/handler.js');

//Instance functions (classes)
var DiskHandler = require('../model/disk.js');
var DirHandler = require('../model/directory.js');
var FileHandler = require('../model/file.js');

function manager(setupObject)
{
	var disksParam, directoriesParam, filesParam, httpParam, authParam, error = false;

	function validateSetupObject() {
		var diskParamValidation = validate.disksParam(setupObject);
		if (diskParamValidation == true) {
			disksParam = setupObject.disks;
		} else {
			error = true;
			console.error(diskParamValidation);
		}

		var dirParamValidation = validate.dirParam(setupObject);
		if (dirParamValidation == true) {
			directoriesParam = setupObject.directories;
		} else {
			error = true;
			console.error(dirParamValidation);
		}

		var fileParamValidation = validate.filesParam(setupObject);
		if (fileParamValidation == true) {
			filesParam = setupObject.files;
		} else {
			error = true;
			console.error(fileParamValidation);
		}

        var httpParamValidation = validate.httpParam(setupObject);
        if (httpParamValidation == true) {
            httpParam = setupObject.http;
        } else {
            error = true;
            console.error(httpParamValidation);
        }

        var authParamValidation = validate.authParam(setupObject);
        if (authParamValidation == true) {
            authParam = setupObject.auth;
        } else {
            error = true;
            console.error(authParamValidation);
        }

		return !error;

	}

	function doInitialSetup(isTest) {
		requestHandler.setupHandlers(new DiskHandler(),
			new DirHandler(), new FileHandler(), eventHandler);
		requestHandler.setupParameters(disksParam, directoriesParam, filesParam, httpParam, authParam);
		requestHandler.setupElementsAndEvents(isTest);
	}

	function load(modalBoxParams) {
		requestHandler.load(modalBoxParams);
        requestHandler.updateButtonDetails(modalBoxParams.button);
	}

	return {
		validateSetupObject : validateSetupObject,
		doInitialSetup : doInitialSetup,
		load : load
	}
}

module.exports = manager;
},{"../handlers/eventHandler.js":3,"../handlers/handler.js":4,"../helpers/validate.js":7,"../model/directory.js":8,"../model/disk.js":9,"../model/file.js":10}],3:[function(require,module,exports){
var element = require('../helpers/element.js');
var util = require('../helpers/util.js');
var reqHandler = require('../handlers/handler.js');

/****************************************************
** Toolbar Events
*****************************************************/
function attachRefreshFilesEvent() {
	element.getFileRefreshBtn().click(function() {
		reqHandler.loadFiles(true);
		clearSearch();
	});
}

function attachAlignFilesAsListEvent() {
	element.getFileAlignListBtn().click(function() {
		reqHandler.getFileHandler().showFileList();
	});
}

function attachAlignFilesAsGridEvent() {
	element.getFileAlignGridBtn().click(function() {
		reqHandler.getFileHandler().showFileGrid();
	});
}

function attachSortFilesEvent() {
	element.getSortFilesDropdown().on('change', function() {
		reqHandler.getFileHandler().sortFilesBy($(this).val());
	});
}


/****************************************************
** Search functionality
*****************************************************/

function closeFileSearch() {
	element.getSearchInput().val('');
	reqHandler.getFileHandler().showFiles();
	element.hide(element.getSearchCancelBtn());
	element.hide(element.getFileSearchOptions());
}

function attachSearchFilesEvent() {
	element.getSearchInput().on('change', searchFiles);
	element.getSearchBtn().click(searchFiles);
	element.getSearchCancelBtn().click(closeFileSearch);

	function searchFiles(hasAlreadySearchedOnce) {
		if (element.getSearchInput().val() == '') {
            closeFileSearch();
        } else {
        	element.show(element.getSearchCancelBtn());
        	reqHandler.getFileHandler().searchFiles(element.getSearchInput().val());
        	if (hasAlreadySearchedOnce != true) {
            	addFileSearchOptions();        		
        	}
        }
	}

    function addFileSearchOptions() {
    	if (reqHandler.isSearchEnabled()) {
    		element.show(element.getFileSearchOptions());
    		element.getFileSearchOptions().empty();

    		addCurrentDirectorySearch();
    		addDisksSearch();
    	}
    }

    function addCurrentDirectorySearch() {
    	
	    var dirName = reqHandler.getDirHandler().getCurrentDirectoryData().name;
	    if (!dirName) dirName = 'This directory';
	    var id = (reqHandler.getDirHandler().isRootDirectory()) ? 'root' : util.slugify(dirName);
	    element.getFileSearchOptions().append($(searchLiElement(id, dirName, 'fa-folder-o')));
	   	element.selectFirst(element.getFileSearchOptions());
	   	element.getFileSearchOptions().find('#'+id).click(function() {
	   		element.selectFirst(element.getFileSearchOptions());
	    	searchFiles(true);
		});
    }

    function addDisksSearch() {
    	var disksParam = reqHandler.getDiskParameter();
		if (disksParam.details && disksParam.search_URL) {
	    	for (var i=0, len = disksParam.details.length; i < len; i++) {
	    		var disk = disksParam.details[i];
	    		var id = 'search_' + util.slugify(disk.label);
				element.getFileSearchOptions().append($(searchLiElement(id, disk.label, 'fa-server')));
				attachDiskSearchEvent(id, disksParam.search_URL, disk.name);
	    	}
	    }
    }

    function attachDiskSearchEvent(id, url, diskName) {
    	element.getFileSearchOptions().find('#'+id).click(function() {
			var liElement = $(this);
            var params = {
                'search': element.getSearchInput().val(),
                'disk': diskName
            };
            reqHandler.makeAjaxRequest(url, success, fail, false, params);

            function fail() {
				alert('failed to search disk');
            }

            function success(data) {
				reqHandler.getFileHandler().showFiles(data.files);
                element.select(element.getFileSearchOptions(), liElement);
            }
		});
    }

    function searchLiElement(id, name, fa_css) {
    	return '<li id="'+id+'"><i class="fa '+fa_css+'" aria-hidden="true"></i>&nbsp;'+name+'</li>';
    }
}

function clearSearch() {
	element.getSearchInput().val('');
}
/****************************************************
** Disk Events
*****************************************************/

function attachDiskElementEvent(callback) {
	element.getDiskDropdown().on('change', function() {
		//TODO Show loading bar
        reqHandler.loadDirectories();
        resetView();
	});
}

/****************************************************
** Directory Events
*****************************************************/
function attachClickEventOnDirectories(dirElement, url, showContextMenu) {

	dirElement.each(function() {
		var liElement = $(this);
		if (showContextMenu) {
			showDirectoryContextMenu(liElement);
		}

		liElement.find('> div').click(function() {

            resetView();
			element.select(element.getDirectories(), liElement);

			if (reqHandler.getDirHandler().childDirOpen(liElement)) {
				reqHandler.getDirHandler().hideSubDirectories(liElement);
			} else {
				fetchSubdirectories(url, function(response) {
					reqHandler.getDirHandler().showSubDirectories(liElement, response);
				});
			}
			reqHandler.loadFiles();		
		});
	});
}

function fetchSubdirectories(url, callback) {

	var params =  {};
	reqHandler.makeAjaxRequest(url, callback, fail, false, params);
	
	function fail() {
		alert('failed to get sub directories');
	}

}
function attachKeysEventOnDirectories(dirElement, url) {
	dirElement.keydown(function(event){
		if ($(event.target).parent().is(dirElement)) {
			var keys = new KeyHandler(event); 
			if (keys[event.which]) keys[event.which]();			
		}
	});

	function KeyHandler(event) {
		return {
			//left
			37 : function() {
				reqHandler.getDirHandler().hideSubDirectories($(event.target));
			},
			//right
			39 : function() {
				fetchSubdirectories(url, function(response) {
					reqHandler.getDirHandler().showSubDirectories($(event.target), response);
				});
			},
			//up
			38 : function() {
				element.moveUp(dirElement, $(event.target), function() {
                    reqHandler.loadFiles();
                });
			},
			//down
			40 : function() {
				element.moveDown(dirElement, $(event.target), function() {
                    reqHandler.loadFiles();
                });
			},
			//tab
			9 : function() {
				reqHandler.getFileHandler().focusFirstElement();
			},
			13 : function() {
				reqHandler.loadFiles();
			}

		}
	}
}

function attachCreateDirectoryEvent(url) {
	var createDirBtn = element.getCreateNewDirectory();
	createDirBtn.click(function(){
		var inputElement = reqHandler.getDirHandler().addNewDirectoryToSelectedDirectory();

		addFocusoutEventOnDirCreateElement(inputElement);
	});

	function addFocusoutEventOnDirCreateElement(inputElement) {
		element.focusAndSelect(inputElement);
		element.focusoutOnEnter(inputElement);

        var oldValue = inputElement.val();
		inputElement.on('focusout', focusOutEvent);
        $(document).click(onOutsideClick);

        function onOutsideClick(e) {
            if ( !$(e.target).is(inputElement)) {
                focusOutEvent();
            }
        }

        function focusOutEvent() {
			var newValue = inputElement.val();
			if (oldValue != newValue && newValue != '') {
			    var params = reqHandler.getDirHandler().getNewDirectoryData(inputElement);
                reqHandler.makeAjaxRequest(url, success, fail, false, params);
            } else {
                element.focusAndSelect(inputElement);
            }
        }

		function success(response) {
			if (response.success == true) {
				var dirElement = reqHandler.getDirHandler().saveDirectory(inputElement, response.directory.name, response.directory.path);
                reqHandler.attachDirectoryEvents(dirElement);
            } else {
                reqHandler.getDirHandler().removeDirectory(inputElement);
            }

            $(document).off('click', onOutsideClick);
		}

		function fail() {
			reqHandler.getDirHandler().removeDirectory(inputElement);
            $(document).off('click', onOutsideClick);
		}
	}
}

function attachRenameDirectoryEvent(dirElement, url) {
	dirElement.each(function() {
		$(this).find('> div').dblclick(function() {
			var inputElement = reqHandler.getDirHandler().renameDirectory($(this));
      
            addFocusoutEventOnDirRenameElement(inputElement);
		});
	});

	function addFocusoutEventOnDirRenameElement(inputElement) {
		element.focusAndSelect(inputElement);
		element.focusoutOnEnter(inputElement);

		var oldValue = inputElement.val();
        inputElement.on('focusout', focusOutEvent);
        $(document).click(onOutsideClick);

        function onOutsideClick(e) {
            if ( !$(e.target).is(inputElement)) {
                focusOutEvent();
            }
        }

        function focusOutEvent() {
            var newValue = inputElement.val();
            if (oldValue != newValue && newValue != '') {
                var params = reqHandler.getDirHandler().getCurrentDirectoryData();
                params.new_value = newValue;
                reqHandler.makeAjaxRequest(url, success, fail, false, params);
            } else {
                reqHandler.getDirHandler().saveDirectory(inputElement, oldValue);
            }
        }

		function success() {
			reqHandler.getDirHandler().saveDirectory(inputElement);
            $(document).off('click', onOutsideClick);
		}

		function fail() {
			reqHandler.getDirHandler().saveDirectory(inputElement, oldValue);
            $(document).off('click', onOutsideClick);
		}
	}
}

function showDirectoryContextMenu(directoryElement) {

	directoryElement.find('>div').off('contextmenu');
	directoryElement.find('>div').on('contextmenu', function(e) {
		directoryElement.find('> div').click();
		showDirectoryMenu(directoryElement);
		hideMenuEventListener(directoryElement, element.getDirectoryContextMenu());
		e.preventDefault();
	});


	function showDirectoryMenu(target) {
		var menu = element.getDirectoryContextMenu();
		element.show(menu);
		positionMenu(target, menu);
	}
}

function attachDeleteDirectoryEvent(deleteURL) {
	var deleteBtn = element.getDeleteDirectory();

	deleteBtn.off('click');
	deleteBtn.on('click', function(){
		var selected = reqHandler.getDirHandler().getCurrentDirectoryElement();
		var directoryData = reqHandler.getDirHandler().getCurrentDirectoryData();
		var data = {
			name : directoryData.name,
			path : directoryData.path
		};

		reqHandler.makeAjaxRequest(deleteURL, success, fail, false, data);

		function success(response) {
			if (response.success == true) {
				reqHandler.getDirHandler().removeDirectory(selected);
				element.select(element.getDirectories(), reqHandler.getDirHandler().getRootDirectory());
			}
		}

		function fail() {

		}
	});
}



/****************************************************
** File Events
*****************************************************/
function attachClickEventOnFiles() {

	element.getFilesGrid().find('li').click(function() {
		element.select(element.getFilesGrid(), $(this));
		reqHandler.getFileHandler().showFileDetails(
			reqHandler.getFileHandler().getCurrentFileDetails()
		);
        element.show(element.getPrimarySubmitButton());
        element.show(element.getFileManageMenu());
	});

	element.getFilesList().find('tbody > tr').click(function() {
		element.selectTableRow(element.getFilesList(), $(this));
        element.show(element.getPrimarySubmitButton());
        element.show(element.getFileManageMenu());
	});

	element.getFileWindow().click(function(event) {
		var selectedFile = element.getSelected(element.getFilesGrid());
        if (selectedFile.length > 0 && !$(event.target).closest('li').is(selectedFile)) {
            element.unselect(selectedFile);
            reqHandler.getFileHandler().hideFileDetails();
            element.hide(element.getPrimarySubmitButton());
            element.hide(element.getFileManageMenu());
        }

        selectedFile = element.getSelected(element.getFilesList());
        if (selectedFile.length > 0 && !$(event.target).closest('tr').is(selectedFile)) {
            element.unselectTableRow(selectedFile);
            element.hide(element.getPrimarySubmitButton());
            element.hide(element.getFileManageMenu());
        }
	});
}

function attachKeysEventOnFiles() {

	element.getFilesGrid().find('> li').keydown(function(event){
		var keys = new GridKeyHandler(event);
		if (keys[event.which]) keys[event.which]();
	});

	element.getFilesList().find('tbody > tr').keydown(function(event){
		var keys = new ListKeyHandler(event);
		if (keys[event.which]) keys[event.which]();
	});

	function GridKeyHandler(event) {
		return {
			//left
			37 : function() {
				element.moveUp(element.getFilesGrid(), $(event.target));
			},
			//right
			39 : function() {
				element.moveDown(element.getFilesGrid(), $(event.target));
			},
			13 : function() {
				// reqHandler.loadFiles();
			}

		}
	}

	function ListKeyHandler(event) {
		return {
			//up
			38 : function() {
				element.moveUpInTable(element.getFilesList(), $(event.target));
			},
			//down
			40 : function() {
				element.moveDownInTable(element.getFilesList(), $(event.target));
			},
			13 : function() {
				// reqHandler.loadFiles();
			}

		}
	}

}

function attachUploadFileEvent(uploadObj) {
	
	//Upload File button click event
	element.getUploadFileBtn().click(function() {
		element.getUploadFileInput().click();
	});

	//On file selection for upload
	element.getUploadFileInput().on('change', function() {
		element.show(element.getFileBrowserUploadForm());
	});

	//On click of upload button for finally upload the file to server
	element.getUploadFileToServerBtn().click(uploadFile);

	//On click of cancel button for cancelling the file upload
	element.getCancelFileUploadBtn().click(closeFileUpload);

	function uploadFile() {
	
		element.show(element.getUploadFileLoadingBar());
		element.hide(element.getFileBrowserUploadForm());
		
		var formData = new FormData(element.getFileBrowserUploadForm()[0]);
        reqHandler.makeAjaxRequest(uploadObj.url, success, fail, false, formData, true);

		function success(response) {
			element.hide(element.getUploadFileLoadingBar());
            reqHandler.getFileHandler().addFileOnUpload(response);
			closeFileUpload();
		}

		function fail() {
			element.hide(element.getUploadFileLoadingBar());
			element.show(element.getFileBrowserUploadForm());
        }
	
	}

	function closeFileUpload() {
		element.hide(element.getFileBrowserUploadForm());
		element.getUploadFileInput().val('');
		element.getUploadFileParameterContainer().find('input').val('');
	}

}

function attachViewFileEvent() {
	element.getViewFile().on('click', function() {
		var selected = reqHandler.getFileHandler().getCurrentFileElement();
		var currentFileDetails = reqHandler.getFileHandler().getCurrentFileDetails();
		alert("selected"+selected.attr('id')+", details :"+JSON.stringify(currentFileDetails));
	});
}

function attachDownloadFileEvent(isAbsolutePath) {
	var downloadBtn = element.getDownloadFile();
	downloadBtn.on('click', function() {
		if (isAbsolutePath == true) {
			downloadBtn.attr('download', '');
			downloadBtn.attr('href', reqHandler.getCurrentFilePath());
		} else {
			// Call the download url			
		}
	});
}

  
function attachRenameFileEvent(url) {

    element.getRenameFile().off('click');
    element.getRenameFileOkay().off('click');
    element.getRenameFileClose().off('click');

	var currentFileDetails;
	var selected;
	element.getRenameFile().on('click', function() {
		currentFileDetails = reqHandler.getFileHandler().getCurrentFileDetails();
		selected = reqHandler.getFileHandler().getCurrentFileElement();

		element.show(element.getRenameFileBox());
		element.getRenameFileInput().val(currentFileDetails.name);
	});

	element.getRenameFileOkay().on('click', function() {
		reqHandler.makeAjaxRequest(url, success, fail, false, { name : element.getRenameFileInput().val()});

		function success() {
			element.hide(element.getRenameFileBox());
			currentFileDetails.name = element.getRenameFileInput().val();
			selected.find('> div > div').text(element.getRenameFileInput().val());
		}

		function fail() {
			alert("failed to rename");
		}
	});

	element.getRenameFileClose().on('click', function() {
		element.hide(element.getRenameFileBox());
	});

}

  
function attachRemoveFileEvent(url) {
	var selected;
    element.getRemoveFile().off('click');
    element.getRemoveFileOkay().off('click');
    element.getRemoveFileClose().off('click');

	element.getRemoveFile().on('click', function() {
		selected = reqHandler.getFileHandler().getCurrentFileElement();
		element.show(element.getRemoveFileBox());
	});

	element.getRemoveFileOkay().on('click', function() {
		reqHandler.makeAjaxRequest(url, success, fail, false, reqHandler.getFileHandler().getCurrentFileDetails());

		function success() {
			element.hide(element.getRemoveFileBox());
			selected.remove();
		}

		function fail() {
			alert("failed to remove ");
		}
	});

	element.getRemoveFileClose().on('click', function() {
		element.hide(element.getRemoveFileBox());
	});

}

function attachFileManageMenuEvent() {

    element.getFileManageMenu().on('click', function() {
        showFileManageMenu($(this));
    });

    hideMenuEventListener(element.getFileManageMenu(), element.getFileContextMenu());

}

function attachFileContextMenuEvent() {

	element.getFilesList().find('tbody > tr').each(function() {
		addContextMenuEventListener($(this), true);
	});

	element.getFilesGrid().find('li').each(function() {
		addContextMenuEventListener($(this), false);
	});

	//hideMenuEventListener($(this));

	function addContextMenuEventListener(target, isTable) {
		target.on('contextmenu', function(e) {
            target.click();
            showFileManageMenu(target, isTable);
			e.preventDefault();
		});
	}

	function showFileManageMenu(target) {
		var menu = element.getFileContextMenu();
		element.show(menu);
		positionMenu(target, menu);
	}
}

function hideMenuEventListener(target, menu) {
    $(document).on('click', function(e) {
        if (target && !target.is($(e.target))) {
            element.hide(menu);
        }
    });
}

function positionMenu(target, menu) {
    // clickCoords = element.getPosition(e);
    var clickCoordsX = target.offset().left;
    var clickCoordsY = target.offset().top + (target.height() / 2);

    var menuWidth = menu.width() + 4;
    var menuHeight = menu.height() + 4;

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    if ( (windowWidth - clickCoordsX) < menuWidth ) {
        menu.css("left", windowWidth - menuWidth + "px");
    } else {
        menu.css("left", clickCoordsX + "px");
    }

    if ( (windowHeight - clickCoordsY) < menuHeight ) {
        menu.css("top", windowHeight - menuHeight + "px");
    } else {
        menu.css("top", clickCoordsY + "px");
    }
}

 function resetView()
 {
     element.getErrorMessagePlaceHolder().empty();
     element.hide(element.getPrimarySubmitButton());
     reqHandler.getFileHandler().cleanUpView();
     closeFileSearch();
 }

module.exports = {

	attachRefreshFilesEvent : attachRefreshFilesEvent,
	attachAlignFilesAsListEvent : attachAlignFilesAsListEvent,
	attachAlignFilesAsGridEvent : attachAlignFilesAsGridEvent,
	attachSortFilesEvent : attachSortFilesEvent,
	attachSearchFilesEvent : attachSearchFilesEvent,

	attachDiskElementEvent : attachDiskElementEvent,

	attachKeysEventOnDirectories : attachKeysEventOnDirectories,
	attachClickEventOnDirectories : attachClickEventOnDirectories,
	attachCreateDirectoryEvent : attachCreateDirectoryEvent,
	attachRenameDirectoryEvent : attachRenameDirectoryEvent,
	attachDeleteDirectoryEvent : attachDeleteDirectoryEvent,

	attachClickEventOnFiles : attachClickEventOnFiles,
	attachKeysEventOnFiles : attachKeysEventOnFiles,
	attachUploadFileEvent : attachUploadFileEvent,

	attachRenameFileEvent : attachRenameFileEvent,
	attachRemoveFileEvent : attachRemoveFileEvent,
	attachViewFileEvent : attachViewFileEvent,
	attachDownloadFileEvent : attachDownloadFileEvent,

	attachFileContextMenuEvent : attachFileContextMenuEvent,
    attachFileManageMenuEvent : attachFileManageMenuEvent,

    resetView : resetView
	
}
},{"../handlers/handler.js":4,"../helpers/element.js":5,"../helpers/util.js":6}],4:[function(require,module,exports){
var element = require('../helpers/element.js');
var util = require('../helpers/util.js');

var diskHandler, dirHandler, fileHandler, eventHandler;
var disksParam = {}, directoriesParam = {}, filesParam = {}, httpParams = {}, authParams = {}, modalBoxParams = {};

/************************************************
* Setup
************************************************/
function setupHandlers(disk, dir, file, eventH) {
	diskHandler = disk;
	dirHandler = dir;
	fileHandler = file;
	eventHandler = eventH;
}

function setupParameters(disk, dir, files, http, auth) {
	disksParam = disk || {};
	directoriesParam = dir || {};
	filesParam = files || {};
    httpParams = http || {};
    authParams = auth || {};
}

function setupElementsAndEvents(isTest) {
	setupFileBrowserModal(function() {
		//Show/Hide manager controls and attach corresponding events
		createDirectorySetup();
		uploadFileSetup();
		setupEvents();
	}, isTest);
}

function setupFileBrowserModal(callback, isTest) {
	if ($('#disk-browser').length == 0) {
		$('body').append('<div id="disk-browser"></div>');
		$('#disk-browser').load(element.getDiskBrowserPath() + '/partials/disk-browser.html', function(){
			if (callback) callback();
		});
	} else if (isTest) {
		callback();
	}

}

function createDirectorySetup() {
	var createDirBtn = element.getCreateNewDirectory();
	(directoriesParam.create) ? element.show(createDirBtn) : element.hide(createDirBtn);
}

function uploadFileSetup() {
	var uploadBtn = element.getUploadFileBtn();
	if (filesParam.upload) {
		loadUploadFormParameters();
		element.show(uploadBtn);
	} else {
		element.hide(uploadBtn);
	}

	function loadUploadFormParameters() {
		if (doesUploadParamExist()) {
			for (var i=0, len = filesParam.upload.params.length; i <len; i++) {
				var param = filesParam.upload.params[i];
				element.getUploadFileParameterContainer().append($(getFormElement(param)));
			}
		}
	}

	function getFormElement(param) {
		return '<input type="text" placeholder="'+param.label+'" name="'+param.name+'" class="form-control"/>'
	}

	function doesUploadParamExist() {
		return typeof(filesParam.upload) == 'object' && filesParam.upload.params;
	}
}

function setupEvents() {
	//Create Directory Event
	if (directoriesParam.create) {
		eventHandler.attachCreateDirectoryEvent(directoriesParam.create);
	}

	//upload File event
	if (filesParam.upload) {
		eventHandler.attachUploadFileEvent(filesParam.upload);
	}
	
	//Attach events to other toolbar buttons
	eventHandler.attachRefreshFilesEvent();
	eventHandler.attachSortFilesEvent();
	eventHandler.attachAlignFilesAsListEvent();
	eventHandler.attachAlignFilesAsGridEvent();

	//Setup search events	
	eventHandler.attachSearchFilesEvent();

}

/************************************************
* Load Disks, directories and files
************************************************/

function load(modalBoxParameters) {
    modalBoxParams = modalBoxParameters || {};
	eventHandler.resetView();

	if (element.getDirectories().find('li').length == 0) {
		loadDisks();
		loadDirectories();
	}
}

function loadDisks() {
	if (disksParam && disksParam.details && disksParam.details.length > 0) {
		diskHandler.loadDisks(disksParam.details);
	} else {
        diskHandler.noDiskSetup(disksParam);
    }
}

function loadDirectories() {
	makeAjaxRequest(directoriesParam.list, success, fail, true, {path : '/'});

	function success(data) {
        dirHandler.loadDirectories(data);
        loadFiles();
	}
	function fail() {
	}
}

function loadFiles(isRefresh) {
    var cache = (isRefresh != true);
	makeAjaxRequest(filesParam.list, success, fail, cache);

	function success(data) {
		fileHandler.loadFiles(data);
		setupSortDropdown();
	}
	function fail() {
	}
}

function setupSortDropdown() {
	element.getSortFilesDropdown().empty();
	element.getSortFilesDropdown().append(getOptionElement('Sort by', ''));

	var responseParams = getFileResponseParams();
	for (var key in responseParams) {
		var param = responseParams[key];
		element.getSortFilesDropdown().append(getOptionElement(param, key));
	}

	function getOptionElement(show, value) {
		return $('<option value="'+value+'">'+show+'</option>');
	}
}

/************************************************
* Setup events for disks, directories and files
************************************************/

function attachDiskElementEvents() {
	eventHandler.attachDiskElementEvent();
}

function attachDirectoryEvents(dirElement) {

	if (dirElement.is('ul')) {
		dirElement = dirElement.find('> li');
    }

	eventHandler.attachKeysEventOnDirectories(dirElement, directoriesParam.list);
	var showContextMenu = (typeof(directoriesParam.delete) != 'undefined');
	eventHandler.attachClickEventOnDirectories(dirElement, directoriesParam.list, showContextMenu);

	renameDirectorySetup();
	deleteDirectorySetup();

	function renameDirectorySetup() {
		if (directoriesParam.update) {
			eventHandler.attachRenameDirectoryEvent(dirElement, directoriesParam.update);
		}
	}

	function deleteDirectorySetup() {
		if (directoriesParam.delete) {
			eventHandler.attachDeleteDirectoryEvent(directoriesParam.delete);
		}
	}
}

function attachFileEvents() {
	eventHandler.attachKeysEventOnFiles();
	eventHandler.attachClickEventOnFiles();

    if (modalBoxParams.context_menu == true) {
        eventHandler.attachFileContextMenuEvent();
    }

	eventHandler.attachFileManageMenuEvent();

	renameFileSetup();	
	deleteFileSetup();
	downloadFileSetup();
	viewFileSetup();

	function renameFileSetup() {
		var renameBtn = element.getRenameFile();
		if (filesParam.update) {
			element.show(renameBtn);
			eventHandler.attachRenameFileEvent(filesParam.update);
		} else {
			element.hide(renameBtn);
		}
	}

	function deleteFileSetup() {
		var deleteBtn = element.getRemoveFile();
		if (filesParam.destroy) {
			element.show(deleteBtn);
			eventHandler.attachRemoveFileEvent(filesParam.destroy);
		} else {
			element.hide(deleteBtn);
		}
	}

	function downloadFileSetup() {
		var downloadBtn = element.getDownloadFile();
		if (filesParam.absolute_path != false || filesParam.download) {
			element.show(downloadBtn);
			var isAbsolutePath = (filesParam.absolute_path != false);
			eventHandler.attachDownloadFileEvent(isAbsolutePath);
		} else {
			element.hide(downloadBtn);
		}
	}

	function viewFileSetup() {
		var viewBtn = element.getViewFile();
		if (filesParam.view) {
			element.show(viewBtn);
			eventHandler.attachViewFileEvent();
		} else {
			element.hide(viewBtn);
		}
	}
}

/************************************************
* Return handlers and setup object parameters
************************************************/

function getFileHandler() {
	return fileHandler;
}

function getDirHandler() {
	return dirHandler;
}

function getDiskHandler() {
	return diskHandler;
}

function isSearchEnabled() {
	return disksParam && disksParam.search == true;
}

function getDiskParameter() {
	return disksParam;
}

/************************************************
 * Handle paths and ajax request
 ************************************************/

function getAbsolutePath(file, path) {
	path = file.path || path;
	return path + ((path.endsWith('/') ? '' : '/')) + file.name;
}

function getRootPathForCurrentDir() {

    var root = diskHandler.getRootPath();
    if (typeof(root) != 'undefined') {
        return root + dirHandler.getCurrentDirectoryPath();
    }
}

function getCurrentFilePath() {
    return getAbsolutePath(fileHandler.getCurrentFileDetails(), getRootPathForCurrentDir());
}

function makeAjaxRequest(url, successCallback, failureCallback, cache, data, isUpload) {

	var method = 'POST';

    if (typeof(cache) == 'undefined') {
        cache = true;
    }
    var params = (isUpload != true) ? addCommonParameters(data) : addCommonParametersToFormData(data);

    showLoadingBar(true);
    $.ajax(getAjaxParameters()).success(function (data) {
		if (successCallback) successCallback(data);
        showLoadingBar(false);
		element.getErrorMessagePlaceHolder().text('');
    }).fail(function (response) {
        if (failureCallback) failureCallback(response);
        showLoadingBar(false);
        updateError(response);
	});

    function getAjaxParameters() {
        var parameters = {
            url : url,
            method : method,
            data : params,
            cache: cache,
            beforeSend: function (request)
            {
                if (httpParams && httpParams.headers) {
                    for (var key in httpParams.headers) {
                        request.setRequestHeader(key, httpParams.headers[key]);
                    }
                }
            }
        };

        if (isUpload == true) {
            parameters.processData = false;
            parameters.contentType = false;
        }
        return parameters;
    }

}

function showLoadingBar(show) {
    if (show == true) {
        element.show(element.getLoadingBar());
        element.deactivate(element.getFileBrowserBody());
    } else {
        element.hide(element.getLoadingBar());
        element.activate(element.getFileBrowserBody());
    }
}

function updateError(response) {
    element.getErrorMessagePlaceHolder().empty();
    var message = 'Request could not be completed.';

    if (httpParams.error) {
        message = httpParams.error(response.status, JSON.parse(response.responseText)) || message;
    }

    element.getErrorMessagePlaceHolder().text(message);
}

function addCommonParametersToFormData(formData) {
	var params = addCommonParameters();
	for (var key in params) {
		formData.append(key, params[key]);
	}

	return formData;
}

function addCommonParameters(params) {

    params = params || {};
    if (!params.disk) {
	    var disk = diskHandler.getCurrentDisk();
	    if (disk) {
	        params.disk = disk.name;
	    }    	
    }

    if (!params.path) {
	    var dirPath = dirHandler.getCurrentDirectoryPath();
	    dirPath =  dirPath || '/';
	    if (dirPath) {
	        params.path = dirPath;
	    }    	
    }

    return params;
}

/****************************************************
 ** file response parameters
 *****************************************************/

function getFileResponseParams() {
    return {
        name : 'Name',
        type : 'Type',
        size : 'size' + ((filesParam.size_unit) ? ('('+filesParam.size_unit+')') : ''),
        modified_at : 'Last Modified Date'
    };
}

function updateButtonDetails(details) {
    if (details && details.text && details.onClick) {
    	details.text = details.text || 'Fetch path';
        element.getPrimarySubmitButton().text(details.text);
        element.getPrimarySubmitButton().off('click');
        element.getPrimarySubmitButton().click(function() {
            if (details.onClick) {details.onClick(getCurrentFilePath());}
            element.hide(element.getPrimarySubmitButton());
            element.closeModal();
        });
    }
}

module.exports = {
	setupHandlers: setupHandlers,
	setupParameters: setupParameters,
	setupElementsAndEvents: setupElementsAndEvents,
	setupEvents: setupEvents,

	load: load,
	loadFiles: loadFiles,
    loadDirectories: loadDirectories,

	getFileHandler: getFileHandler,
	getDiskHandler: getDiskHandler,
	getDirHandler: getDirHandler,

	getDiskParameter: getDiskParameter,
	isSearchEnabled: isSearchEnabled,

	attachDiskElementEvents: attachDiskElementEvents,
	attachDirectoryEvents: attachDirectoryEvents,
	attachFileEvents: attachFileEvents,

	getAbsolutePath: getAbsolutePath,
    makeAjaxRequest: makeAjaxRequest,
    getRootPathForCurrentDir: getRootPathForCurrentDir,
    getCurrentFilePath: getCurrentFilePath,
    getFileResponseParams: getFileResponseParams,
    updateButtonDetails : updateButtonDetails

};
},{"../helpers/element.js":5,"../helpers/util.js":6}],5:[function(require,module,exports){
var fbElement,
    primaryBtn,
    loadingBar,
    errorMessage,
    fileBrowserBody,

    diskDropdown,

    directoryWindow,
    directoriesList,
    createNewDirectory,

    fileWindow,
    fileList,
    fileGrid,

    fileContextMenu,
    fileRename,
    fileRemove,
    fileDownload,
    fileView,
    fileManageMenu,

    directoryContextMenu,
    deleteDirectory,

    fileRenameBox,
    fileRenameClose,
    fileRenameOkay,
    fileRenameInput,

    fileRemoveBox,
    fileRemoveClose,
    fileRemoveOkay,

    uploadFileBtn,
    uploadFileInput,
    cancelFileUploadBtn,
    uploadFileToServerBtn,
    fileBrowserUploadForm,
    uploadFileParamContainer,
    uploadFileLoadingBar,

    fileRefreshBtn,
    fileAlignListBtn,
    fileAlignGridBtn,
    sortFilesDropdown,
    showFileDetailsDiv,

    searchBtn,
    searchCancelBtn,
    searchInput,
    fileSearchOptions
    ;


function flush() {
    fbElement = undefined;
    primaryBtn = undefined;
    loadingBar = undefined;
    errorMessage = undefined;
    fileBrowserBody = undefined;

    diskDropdown = undefined;

    directoryWindow = undefined;
    directoriesList = undefined;
    createNewDirectory = undefined;

    fileWindow = undefined;
    fileList = undefined;
    fileGrid = undefined;

    fileContextMenu = undefined;
    fileRename = undefined;
    fileRemove = undefined;
    fileDownload = undefined;
    fileView = undefined;
    fileManageMenu = undefined;

    directoryContextMenu = undefined;
    deleteDirectory = undefined;

    fileRenameBox = undefined;
    fileRenameClose = undefined;
    fileRenameOkay = undefined;
    fileRenameInput = undefined;

    fileRemoveBox = undefined;
    fileRemoveClose = undefined;
    fileRemoveOkay = undefined;

    uploadFileBtn = undefined;
    uploadFileInput = undefined;
    cancelFileUploadBtn = undefined;
    uploadFileToServerBtn = undefined;
    fileBrowserUploadForm = undefined;
    uploadFileParamContainer = undefined;
    uploadFileLoadingBar = undefined;

    fileRefreshBtn = undefined;
    fileAlignListBtn = undefined;
    fileAlignGridBtn = undefined;
    sortFilesDropdown = undefined;
    showFileDetailsDiv = undefined;

    searchBtn = undefined;
    searchCancelBtn = undefined;
    searchInput = undefined;
    fileSearchOptions = undefined;
}
/************************************************
* Browser window
************************************************/

function getFileBrowser() {

    if (!fbElement || fbElement.length == 0) {
        fbElement= $('#FileBrowser');
    }

    return fbElement;

}

function getPrimarySubmitButton() {
    if (!primaryBtn  || primaryBtn.length == 0) {
        primaryBtn= getFileBrowser().find('#fb-primary-btn');
    }

    return primaryBtn;
}

function getLoadingBar() {
    if (!loadingBar  || loadingBar.length == 0) {
        loadingBar= getFileBrowser().find('#loading_bar');
    }

    return loadingBar;
}

function getFileBrowserBody() {
    if (!fileBrowserBody  || fileBrowserBody.length == 0) {
        fileBrowserBody= getFileBrowser().find('.modal-body');
    }

    return fileBrowserBody;
}

function getErrorMessagePlaceHolder() {
    if (!errorMessage  || errorMessage.length == 0) {
        errorMessage= getFileBrowser().find('#error_message');
    }

    return errorMessage;
}



/************************************************
* Disk Elements
************************************************/

function getDiskDropdown() {

    if (!diskDropdown  || diskDropdown.length == 0) {
        diskDropdown= getFileBrowser().find('#disk_selector');
    }

    return diskDropdown;

}

/************************************************
* Directory Elements
************************************************/

function getDirectoryWindow() {

    if (!directoryWindow || directoryWindow.length == 0) {
      directoryWindow= getFileBrowser().find('.directories');  
    } 

    return directoryWindow;

}

function getDirectories() {

    if (!directoriesList  || directoriesList.length == 0) {
        directoriesList= getDirectoryWindow().find('ul#directories-list');
    }

    return directoriesList;

}


function getCreateNewDirectory() {

    if(!createNewDirectory || createNewDirectory.length == 0) {
        createNewDirectory = getFileBrowser().find('#fb_create_new_directory');
    }

    return createNewDirectory;

}

/************************************************
 * Directory context menu
 ************************************************/

function getDirectoryContextMenu() {
    if(!directoryContextMenu || directoryContextMenu.length == 0) {
        directoryContextMenu = getFileBrowser().find('#directory-context-menu');
    }

    return directoryContextMenu;


}

function getDeleteDirectory() {

    if(!deleteDirectory || deleteDirectory.length == 0) {
        deleteDirectory = getDirectoryContextMenu().find('#remove-directory');
    }

    return deleteDirectory;

}

/************************************************
* File Elements
************************************************/

function getFileWindow() {

    if (!fileWindow || fileWindow.length == 0) {
        fileWindow= getFileBrowser().find('.files');
    }

    return fileWindow;

}

function getFilesList() {

    if (!fileList || fileList.length == 0) {
        fileList= getFileWindow().find('#files-list');
    }

    return fileList;

}

function getFilesGrid() {

    if (!fileGrid || fileGrid.length == 0) {
        fileGrid= getFileWindow().find('#files-grid');
    }

    return fileGrid;

}

function getFileDetailsDiv() {

    if (!showFileDetailsDiv || showFileDetailsDiv.length == 0) {
        showFileDetailsDiv = getFileBrowser().find('#show-file-details');
    }

    return showFileDetailsDiv;

}

function getFileManageMenu() {

    if (!fileManageMenu || fileManageMenu.length == 0) {
        fileManageMenu = getFileBrowser().find('#fb_file_manage');
    }

    return fileManageMenu;

}

/************************************************
* Elements in file right click menu
************************************************/

function getFileContextMenu() {

    if (!fileContextMenu || fileContextMenu.length == 0) {
        fileContextMenu = getFileBrowser().find('#file-context-menu');
    }

    return fileContextMenu;

}

function getViewFile() {
    if (!fileView || fileView.length == 0) {
        fileView = getFileContextMenu().find('#view-file');
    }

    return fileView;
}

function getDownloadFile() {
    if (!fileDownload || fileDownload.length == 0) {
        fileDownload = getFileContextMenu().find('#download-file');
    }

    return fileDownload;
}

function getRenameFile() {
    if (!fileRename || fileRename.length == 0) {
        fileRename = getFileContextMenu().find('#rename-file');
    }

    return fileRename;
}

function getRemoveFile() {
    if (!fileRemove || fileRemove.length == 0) {
        fileRemove = getFileContextMenu().find('#remove-file');
    }

    return fileRemove;
}

/************************************************
* Rename File elements
************************************************/

function getRenameFileBox() {
    if (!fileRenameBox || fileRenameBox.length == 0) {
        fileRenameBox = getFileWindow().find('#rename-file-box');
    }

    return fileRenameBox;
}

function getRenameFileOkay() {
    if (!fileRenameOkay || fileRenameOkay.length == 0) {
        fileRenameOkay = getRenameFileBox().find('#rename-file-ok');
    }

    return fileRenameOkay;
}

function getRenameFileClose() {
    if (!fileRenameClose || fileRenameClose.length == 0) {
        fileRenameClose = getRenameFileBox().find('#rename-file-close');
    }

    return fileRenameClose;
}

function getRenameFileInput() {
    if (!fileRenameInput || fileRenameInput.length == 0) {
        fileRenameInput = getRenameFileBox().find('#rename-file-name');
    }

    return fileRenameInput;
}

/************************************************
* Remove File elements
************************************************/

function getRemoveFileBox() {
    if (!fileRemoveBox || fileRemoveBox.length == 0) {
        fileRemoveBox = getFileWindow().find('#remove-file-box');
    }

    return fileRemoveBox;
}

function getRemoveFileOkay() {
    if (!fileRemoveOkay || fileRemoveOkay.length == 0) {
        fileRemoveOkay = getRemoveFileBox().find('#remove-file-ok');
    }

    return fileRemoveOkay;
}

function getRemoveFileClose() {
    if (!fileRemoveClose || fileRemoveClose.length == 0) {
        fileRemoveClose = getRemoveFileBox().find('#remove-file-close');
    }

    return fileRemoveClose;
}

/************************************************
* Upload File Elements
************************************************/

function getUploadFileInput() {

    if(!uploadFileInput || uploadFileInput.length == 0) {
        uploadFileInput = getFileBrowser().find('#upload_file');
    }

    return uploadFileInput;

}

function getUploadFileBtn() {

    if(!uploadFileBtn  || uploadFileBtn.length == 0) {
        uploadFileBtn = getFileBrowser().find('#upload_file_btn');
    }

    return uploadFileBtn;

}

function getCancelFileUploadBtn() {

    if(!cancelFileUploadBtn  || cancelFileUploadBtn.length == 0) {
        cancelFileUploadBtn = getFileBrowser().find('#cancel_file_upload');
    }

    return cancelFileUploadBtn;

}

function getUploadFileParameterContainer() {

    if (!uploadFileParamContainer || uploadFileParamContainer.length == 0) {
        uploadFileParamContainer = getFileBrowser().find('#upload_file_parameters');
    }

    return uploadFileParamContainer;

}

function getUploadFileToServerBtn() {

    if(!uploadFileToServerBtn  || uploadFileToServerBtn.length == 0) {
        uploadFileToServerBtn = getFileBrowser().find('#upload_file_to_Server');
    }

    return uploadFileToServerBtn;

}

function getFileBrowserUploadForm() {

    if(!fileBrowserUploadForm || fileBrowserUploadForm.length == 0) {
        fileBrowserUploadForm = getFileWindow().find('#file_browser_upload');
    }

    return fileBrowserUploadForm;

}

function getUploadFileLoadingBar() {

    if(!uploadFileLoadingBar || uploadFileLoadingBar.length == 0) {
        uploadFileLoadingBar = getFileWindow().find('#upload_file_loading');
    }

    return uploadFileLoadingBar;

}

/************************************************
* Toolbar elements
************************************************/

function getFileRefreshBtn() {

    if(!fileRefreshBtn  || fileRefreshBtn.length == 0) {
        fileRefreshBtn = getFileBrowser().find('#fb_refresh');
    }

    return fileRefreshBtn;

}

function getFileAlignListBtn() {

    if(!fileAlignListBtn || fileAlignListBtn.length == 0) {
        fileAlignListBtn = getFileBrowser().find('#fb_align_list');
    }

    return fileAlignListBtn;

}

function getFileAlignGridBtn() {

    if(!fileAlignGridBtn || fileAlignGridBtn.length == 0) {
        fileAlignGridBtn = getFileBrowser().find('#fb_align_grid');
    }

    return fileAlignGridBtn;

}

function getSortFilesDropdown() {

    if(!sortFilesDropdown || sortFilesDropdown.length == 0) {
        sortFilesDropdown = getFileBrowser().find('#fb_sort_files');
    }

    return sortFilesDropdown;

}

/************************************************
* Search file elements
************************************************/

function getSearchBtn() {

    if(!searchBtn || searchBtn.length == 0) {
        searchBtn = getFileBrowser().find('#fb_search_submit');
    }

    return searchBtn;

}

function getSearchCancelBtn() {

    if(!searchCancelBtn || searchCancelBtn.length == 0) {
        searchCancelBtn = getFileBrowser().find('#fb_search_cancel');
    }

    return searchCancelBtn;

}

function getSearchInput() {

    if(!searchInput || searchInput.length == 0) {
        searchInput = getFileBrowser().find('#fb_search_input');
    }

    return searchInput;

}

function getFileSearchOptions() {

    if (!fileSearchOptions || fileSearchOptions.length == 0) {
        fileSearchOptions = getFileBrowser().find('#fb_file_search_options');
    }

    return fileSearchOptions;

}

/************************************************
* Utility functions on elements
************************************************/

function show(elem) {

    elem.removeClass('hidden');

}

function hide(elem) {

    elem.addClass('hidden');

}

function moveUpInTable (table, row) {
    var success = false;
    var elements = table.find('tbody > tr');
    elements.each(function (index) {
        if ($(this).is(row) && index > 0) {
            var prev = elements[index - 1];
            focusTableElement(table, $(prev)); 
            success = true;
            return false;
        }
    });
    return success;
}

function moveDownInTable (table, row) {
    var success = false;
    var elements = table.find('tbody > tr');
    elements.each(function (index) {
        if ($(this).is(row) && index < elements.length - 1) {
            var next = elements[index + 1];
            focusTableElement(table, $(next)); 
            success = true;
            return false;
        }
    });
    return success;
}

function focusTableElement(table, row) {
    selectTableRow(table, row);
    row.click();
    row.focus();
}

function moveUp(ulElement, liElement, callback) {

    var success = false;
    var elements = ulElement.find('li');
    elements.each(function (index) {
        if ($(this).is(liElement)) {
            if (index > 0) {
                //Select previous element 
                var prev = elements[index - 1];
                focusElement(ulElement, $(prev));
            } else {
                //select parent element
                selectParentElement(ulElement, liElement);
            }
            if (callback) {
                callback();
            }
            success = true;
            return false;
        }
    });

    function selectParentElement(ulElement, liElement) {
        var parent = ulElement.closest('li');
        if (parent.length > 0) {
            unselect(liElement);
            focusElement(parent.closest('ul'), parent);
        }       
    }

    return success;
}

function moveDown(ulElement, liElement, callback) {

    var success = false;
    var elements = ulElement.find('li');
    elements.each(function (index) {
        if ($(this).is(liElement)) {
            if (index < elements.length - 1) {
                var next = elements[index + 1];
                //Select next element
                focusElement(ulElement, $(next));
            } else {
                //Select next element in parent
                selectNextParentElement(ulElement, liElement);
            }
            if (callback) {
                callback();
            }
            success = true;
            return false;
        }

    });

    function selectNextParentElement(ulElement, liElement) {
        var parent = ulElement.closest('li').next();
        if (parent.length > 0) {
            unselect(liElement);
            focusElement(parent.closest('ul'), parent);
        }       
    }

    return success;
}

function focusElement(ulElement, element) {
    select(ulElement, element);
    element.click();
    element.focus();
}

function focusAndSelect(input) {

    input.focus();
    input.select();

}

function select(ulElement, liElement) {

    ulElement.find('li').removeClass('active');
    liElement.addClass('active');

}

function getSelected(element) {

    return element.find('.active');
}

function unselect(liElement) {
    liElement.removeClass('active');
}

function selectFirst(ulElement) {

    ulElement.find('li').removeClass('active');
    ulElement.find('li').eq(0).addClass('active');

}

function selectTableRow(table, row) {

    table.find('tbody tr').removeClass('active');
    row.addClass('active');
}

function unselectTableRow(row) {
    row.removeClass('active');
}


function openModal(allowResizing, callback) {

    getFileBrowser().modal({
        keyboard: false,
        backdrop: 'static'
    });

    if (allowResizing == true) {
        allowModalResize();

        $(window).resize(function(){
            allowModalResize();
        });
    }
}

function getDiskBrowserPath() {
    var scripts = document.getElementsByTagName('SCRIPT');
    var path = '';
    if(scripts && scripts.length>0) {
        for(var i in scripts) {
            if(scripts[i].src && scripts[i].src.match(/\/disk-browser\.js$/)) {
                path = scripts[i].src.replace(/(.*)\/js\/disk-browser\.js$/, '$1');
                break;
            }
        }
    }
    return path;
}

function allowModalResize() {
    var modalContent = getFileBrowser().find('.modal-content');
    
    if ($(window).width() >= 800){
        modalContent.resizable({
            handles: 'e, w',
            minWidth: 900
        });

        getFileBrowser().on('show.bs.modal', function () {
            $(this).find('.modal-body').css({
                'max-height':'100%'
            });
        });

        getFileBrowser().resize(function() {
            getFileBrowser().find('.modal-content').css("height", "auto");
        });
    } else {
        modalContent.resizable("destroy");
    }
}

function closeModal() {

    getFileBrowser().modal('hide');

}

function focusoutOnEnter(inputElement) {

    inputElement.keydown(function (e) {
        if (e.which == 13) {
            inputElement.focusout();
        }
    });
}

function deactivate(element) {
    element.addClass('deactivate');
}

function activate(element) {
    element.removeClass('deactivate');
}

module.exports = {
    getFileBrowser: getFileBrowser,
    getPrimarySubmitButton: getPrimarySubmitButton,
    getLoadingBar: getLoadingBar,
    getFileBrowserBody: getFileBrowserBody,
    getErrorMessagePlaceHolder: getErrorMessagePlaceHolder,

    getDiskDropdown: getDiskDropdown,
    
    getDirectoryWindow: getDirectoryWindow,
    getDirectories: getDirectories,
    getCreateNewDirectory: getCreateNewDirectory,

    getFileWindow: getFileWindow,
    getFilesList: getFilesList,
    getFilesGrid: getFilesGrid,
    getFileDetailsDiv: getFileDetailsDiv,
    getFileManageMenu: getFileManageMenu,

    getFileContextMenu: getFileContextMenu,
    getViewFile: getViewFile,
    getDownloadFile: getDownloadFile,
    getRenameFile: getRenameFile,
    getRemoveFile: getRemoveFile,

    getDirectoryContextMenu: getDirectoryContextMenu,
    getDeleteDirectory: getDeleteDirectory,

    getRenameFileBox: getRenameFileBox,
    getRenameFileInput : getRenameFileInput,
    getRenameFileClose : getRenameFileClose,
    getRenameFileOkay : getRenameFileOkay,

    getRemoveFileBox: getRemoveFileBox,
    getRemoveFileClose : getRemoveFileClose,
    getRemoveFileOkay : getRemoveFileOkay,

    getUploadFileBtn: getUploadFileBtn,
    getUploadFileInput: getUploadFileInput,
    getFileBrowserUploadForm: getFileBrowserUploadForm,
    getUploadFileParameterContainer : getUploadFileParameterContainer,
    getUploadFileToServerBtn: getUploadFileToServerBtn,
    getCancelFileUploadBtn: getCancelFileUploadBtn,
    getUploadFileLoadingBar: getUploadFileLoadingBar,
    
    getFileRefreshBtn: getFileRefreshBtn,
    getFileAlignListBtn: getFileAlignListBtn,
    getFileAlignGridBtn: getFileAlignGridBtn,
    getSortFilesDropdown: getSortFilesDropdown,
    
    getSearchBtn: getSearchBtn,
    getSearchCancelBtn: getSearchCancelBtn,
    getSearchInput: getSearchInput,
    getFileSearchOptions: getFileSearchOptions,

    moveDown: moveDown,
    moveUp: moveUp,
    moveDownInTable: moveDownInTable,
    moveUpInTable: moveUpInTable,
    focusAndSelect: focusAndSelect,
    focusoutOnEnter: focusoutOnEnter,
    select: select,
    selectFirst: selectFirst,
    getSelected: getSelected,
    unselect: unselect,
    selectTableRow: selectTableRow,
    unselectTableRow: unselectTableRow,
    show: show,
    hide: hide,
    openModal: openModal,
    closeModal: closeModal,
    activate: activate,
    deactivate: deactivate,
    getDiskBrowserPath: getDiskBrowserPath,
    flush: flush
};

},{}],6:[function(require,module,exports){
var fileExtensions = {
    Image : ['jpg', 'png', 'gif', 'jpeg', 'tiff', 'bmp'],
    Excel : ['xls', 'xlsx'],
    Text : ['txt'],
    PDF : ['pdf'],
    Word : ['doc', 'docx'],
    Javascript : ['js'],
    Css : ['css'],
    JSON : ['json'],
    xml : ['xml']
};
var fontClassesForFileType = {
    Image : 'fa-file-image-o',
    Excel : 'fa-file-excel-o',
    Text : 'fa-file-text-o',
    PDF : 'fa-file-pdf-o',
    Word : 'fa-file-word-o',
    Javascript : 'fa-file-code-o',
    Css : 'fa-file-code-o',
    JSON : 'fa-file-code-o',
    xml : 'fa-file-code-o'
};

function slugify(name) {
    return name.toLowerCase().replace(new RegExp(' ', 'g'), '_')
        .replace(new RegExp('/', 'g'), '_')
        .replace('.', '_')
        ;
}

function unSlugify(name) {
    return capitalizeFirstLetter(name.replace(new RegExp('_', 'g'), ' '));
}

function isImage(type) {
    return (type == 'Image');
}

function getFontAwesomeClass(type) {
    var css = fontClassesForFileType[type];
    css = css || 'fa-file-o';
    return css;
}

function compareAsc(a, b, prop) {
    if (typeof(a[prop]) == 'number') {
        return compareAscNumbers(a, b, prop);
    } else {
        if (a[prop] < b[prop])
            return -1;
        else if (a[prop] > b[prop])
            return 1;
        else
            return 0;

    }
}

function compareAscNumbers(a, b, prop) {
    return a[prop] - b[prop];
}

function compareDesc(a, b, prop) {
    if (typeof(a[prop]) == 'number') {
        return compareDescNumbers(a, b, prop);
    } else {
        if (a[prop] > b[prop])
            return -1;
        else if (a[prop] < b[prop])
            return 1;
        else
            return 0;
    }
}

function compareDescNumbers(a, b, prop) {
    return b[prop] - a[prop];
}

function sortByType(object, type, order) {
    return object.sort(function (a, b) {
        if (order) {
            return compareAsc(a, b, type);
        } else {
            return compareDesc(a, b, type);
        }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getCookie(cookieName) {
    var cookies = document.cookie;
    var cookieArray = cookies.split(';');

    for (var i = 0, len = cookieArray.length; i < len; i++) {
        var cookie = cookieArray[i];
        var keyValue = cookie.split('=');
        if (keyValue.length > 0 && keyValue[0] == cookieName) {
            return keyValue[1];
        }
    }
}

function getFileType(filename) {

    var extension = filename.split('.').pop();

    for (var type in fileExtensions) {
        if (fileExtensions[type].indexOf(extension) > - 1) {
            return type;
        }
    }
}

module.exports = {
    slugify: slugify,
    unSlugify: unSlugify,
    isImage: isImage,
    getFontAwesomeClass: getFontAwesomeClass,
    sortByType: sortByType,
    getCookie: getCookie,
    getFileType: getFileType
};
},{}],7:[function(require,module,exports){
var validation = {
	disks: {
		types : ['object'],
		required : [],
		optional : ['search', 'details', 'search_URL'],
		field_required : false
	},
	details: {
		types : ['array', 'object'],
		required : ['name', 'label'],
		optional : ['search_URL'],
		field_required : false
	},
	directories : {
		types : ['object'],
		required : ['list'],
		optional : ['destroy', 'upload', 'update'],
		field_required : true
	},
	files : {
		types : ['object'],
		required : ['list'],
		optional : ['destroy', 'upload', 'update', 'unit'],
		field_required : true
	},
	name : {
		types : ['string'],
		value : true
	},
	label : {
		types : ['string'],
		value : true,
	},
	list : {
		types : ['string', 'object'],
		required : ['url'],
		value : true
	},
	upload : {
		types : ['string', 'object'],
		required : ['url', 'params']
	},
	destroy : {
		types : ['string', 'object'],
		required : ['url']
	},
	update : {
		types : ['string', 'object'],
		required : ['url']
	},
	search : {
		types : ['boolean']
	},
	search_URL : {
		types : ['string', 'object'],
		required : ['url'],
		value : true
	},
	params : {
		types : ['object', 'array']
	},
	unit : {
		types : ['string']
	},
    authentication : {
        types : ['string'],
        field_required : false,
        value : true,
        valid : ['session', 'basic']
    },
    http : {
        types : ['object'],
        field_required : false,
        required : []
    }
};

function disksParam(object) {
	var isValidated = validate(object.disks, validation.disks, 'disks');
	if (isValidated == true && object.disks) {
		isValidated = validateProperties(object.disks, validation.disks);
	}
	return isValidated;
}

function dirParam(object) {
	var isValidated = validate(object.directories, validation.directories, 'directories');
	if (isValidated == true && object.directories) {
		isValidated = validateProperties(object.directories, validation.directories);
	}
	return isValidated;
}

function filesParam(object) {
	var isValidated = validate(object.files, validation.files, 'files');
	if (isValidated == true && object.files) {
		isValidated = validateProperties(object.files, validation.files);
	}
	return isValidated;
}

function httpParam(object) {
	var isValidated = validate(object.http, validation.http, 'http');
	if (isValidated == true && object.http) {
		isValidated = validateProperties(object.http, validation.http);
	}
	return isValidated;
}

function authParam(object) {
	var isValidated = validate(object.authentication, validation.authentication, 'authentication');
	if (isValidated == true && object.authentication) {
		isValidated = validateProperties(object.authentication, validation.authentication);
	}
	return isValidated;
}

function validateProperties(object, validation) {
	
	function validateProperty(object) {
		var isValidated = validateRequiredProperties(object, validation.required);
		return (isValidated == true) ?
				validateOptionalProperties(object, validation.optional) 
				: isValidated;

	}

	var isValidated = true;
	if (isArrayType(validation)) {
		for (var i=0, len = object.length; i < len ; i++) {
			isValidated = validateProperty(object[i]);
			if (isValidated != true) break;			
		}	
	} else {
		isValidated = validateProperty(object);
	}
	return isValidated;
}

function isArrayType(params) {
	return params.types.indexOf('array') > -1;
}

function validateRequiredProperties(object, properties) {
    if (properties) {
        for (var i=0, len = properties.length; i < len ; i++) {
            var property = properties[i];
            var isValiated = validate(object[property], validation[property], property, true);
            if (isValiated != true) return isValiated;
        }
    }
	return true;
}

function validateOptionalProperties(object, properties) {
    if (properties) {
        for (var i=0, len = properties.length; i < len ; i++) {
            var property = properties[i];
            if (object[property]) {
                var isValidated = validate(object[property], validation[property], property, false);
                if (isValidated != true) return isValidated;
            }
        }
    }
	return true;
}

function validate(object, params, name, required) {

	var message = '';

	function isPresent() {
		return (typeof(object) != "undefined");
	}

	function isFieldMandatory() {
	 	message = name + ' parameter is mandatory.';
		return (required || params.field_required);
	}

	function isTypeValid() {
		message = name + " parameter is of invalid type.";
		return (params.types.indexOf(typeof(object)) > -1);
	}

	function containsRequiredAttributes() {
		
		function checkArray() {
			var present = true;
			for (var i=0, len = object.length; i < len ; i++) {
				present = isRequiredPresent(object[i]);

				if (!present) break; 
			}
			return present;
		}

		function isRequiredPresent(param) {
			var present = true;
	
			if (typeof(param) == 'object' && params.required) {
				for (var i=0, len = params.required.length; i < len ; i++) {
					var item = params.required[i];
					present = (typeof(param[item]) != "undefined");

					if (!present) {
						message = name +" parameter does not contain mandatory field : "+item+".";
						break;
					}
				}

			}
			return present;
		}

		return (isArrayType(params)) ? checkArray() : isRequiredPresent(object);
	}

	function hasValue() {
		message = name + ' should have a value';
		return  (typeof(object) != 'string') || (!params.value) || 
				(typeof(object) == 'string' && params.value == true && object != '');
	}

    function hasCorrectValue() {
        message = name + ' should have correct value';
        return (typeof(object) != 'string') || (!params.valid) || (typeof(object) == 'string' && params.valid && params.valid.indexOf(object) > -1);
    }

    function isBoolean() {
		message = name + ' should be boolean';
		return  (typeof(object) != 'boolean') || 
				(typeof(object) == 'boolean' && (object != true || object != false));
	}

	return (!isFieldMandatory() && !isPresent()) ||
		   (isPresent() && isTypeValid() && containsRequiredAttributes() && hasValue() && isBoolean() && hasCorrectValue()) ||
		   (message);
}



module.exports = {
	disksParam : disksParam,
	dirParam : dirParam,
	filesParam : filesParam,
    httpParam : httpParam,
    authParam : authParam
}
},{}],8:[function(require,module,exports){
var util = require('../helpers/util.js');
var element = require('../helpers/element.js');
var reqHandler = require('../handlers/handler.js');

var directoriesData = {};

/**
 * Constructor for Directory.
 *
 * @returns {{loadDirectories: loadDirectories, showSubDirectories: showSubDirectories, hideSubDirectories: hideSubDirectories, addNewDirectoryToSelectedDirectory: addNewDirectoryToSelectedDirectory, getNewDirectoryData: getNewDirectoryData, saveDirectory: saveDirectory, removeDirectory: removeDirectory, renameDirectory: renameDirectory, getCurrentDirectoryElement: getCurrentDirectoryElement, getCurrentDirectoryData: getCurrentDirectoryData, getCurrentDirectoryPath: getCurrentDirectoryPath, getRootDirectory: getRootDirectory, childDirOpen: childDirOpen, isRootDirectory: isRootDirectory}}
 */
function directory() {
    return {
        loadDirectories : loadDirectories,
        showSubDirectories : showSubDirectories,
        hideSubDirectories : hideSubDirectories,
        
        addNewDirectoryToSelectedDirectory : addNewDirectoryToSelectedDirectory,
        getNewDirectoryData : getNewDirectoryData,

        saveDirectory : saveDirectory,
        removeDirectory : removeDirectory,

        renameDirectory : renameDirectory,

        getCurrentDirectoryElement : getCurrentDirectoryElement,
        getCurrentDirectoryData : getCurrentDirectoryData,
        getCurrentDirectoryPath : getCurrentDirectoryPath,
        getRootDirectory : getRootDirectory,
        childDirOpen : childDirOpen,
        isRootDirectory : isRootDirectory
        
    };
}

/**
 * Load directories and sub directories.
 *
 * @param data
 */
function loadDirectories(data) {
    directoriesData = {};
    addDirectoriesElements(element.getDirectories(), data, true);
    reqHandler.attachDirectoryEvents(element.getDirectories());
    element.selectFirst(element.getDirectories());
}

/**
 * Show all the sub directories for a given directory.
 *
 * @param liElement
 * @param directories
 */
function showSubDirectories(liElement, directories) {
    if (liElement.find('ul').length == 0 && !isRootDirectory()) {
        if (directories && directories.length > 0) {
            liElement.append($('<ul></ul>'));
            addDirectoriesElements(liElement.find('ul'), directories, false);
            reqHandler.attachDirectoryEvents(liElement.find('ul'));
        }
    }
}

/**
 * Hide all the sub directories inside a given directory.
 *
 * @param liElement
 */
function hideSubDirectories(liElement) {
    liElement.find('ul').remove();
}

/**
 * Add a directory elements to the parent directory.
 *
 * @param directoryUlElement
 * @param directories
 * @param isRoot
 */
function addDirectoriesElements(directoryUlElement, directories, isRoot) {
    directoryUlElement.empty();
    
    if (isRoot) addRootDirTo(directoryUlElement);

    for (var i=0, len = directories.length; i < len; i++) {
        var directory = directories[i];
        directory.id = util.slugify(directory.name);
        var li = getDirectoryElement(directory);
        directoryUlElement.append($(li));

        directoriesData[directory.id] = directory;
    }
}

/**
 * Allow to rename a directory.
 *
 * @param dirElement
 * @returns {*}
 */
function renameDirectory (dirElement) {
    var editable = dirElement.find('span.editable');
    editable.replaceWith('<input value="' + editable.text() + '"/>');
    var inputElement = dirElement.find('input');
    return inputElement;
}

/**
 * Create a new directory under a root or any other directory.
 *
 * @returns {*}
 */
function addNewDirectoryToSelectedDirectory() {
    var selectedDir = getCurrentDirectoryElement();
    var parentDir;

    if (isRootDirectory(selectedDir)) {
        parentDir = selectedDir.closest('ul');
    } else {
        if (selectedDir.find('> ul').length == 0) {
            selectedDir.append($('<ul></ul>'));
        }
        parentDir = selectedDir.find('> ul');
    }
    parentDir.append($(getNewDirectoryElement()));

    return parentDir.find('input');
}

/**
 * Get New directory details.
 *
 * @param inputElement
 * @returns {{name: *}}
 */
function getNewDirectoryData(inputElement) {
    var parent_dir = getDirectoryData(inputElement.closest('ul').closest('li'));
    return {
        name : inputElement.val()
    }
}

/**
 * Save details of the newly created or renamed directory.
 *
 * @param inputElement
 * @param value
 * @param path
 * @returns {*}
 */
function saveDirectory(inputElement, value, path) {
    if (!value) value = inputElement.val();
    var directoryBox = inputElement.closest('div')
    directoryBox.attr('id', util.slugify(value));
    inputElement.replaceWith('<span class="editable">' + value+ '</span>');
    var directory = {};
    directory.name = value;
    directory.path = path;
    directoriesData[util.slugify(value)] = directory;
    return directoryBox.closest('li');
}

/**
 * Remove a given directory.
 *
 * @param element
 */
function removeDirectory(element) {
    var liElement = element;
    if (!element.is('li')) {
        liElement = element.closest('li');
    }
    liElement.remove();
}

/****************************************************
** Support functions
*****************************************************/

function getCurrentDirectoryElement() {
    return element.getDirectories().find('li.active');
    return {
        data : getDirectoryData(dir),
        element : dir
    }
}

function getCurrentDirectoryData() {
    return getDirectoryData(getCurrentDirectoryElement());
}

function getCurrentDirectoryPath() {
    var currentElement = getCurrentDirectoryElement();

    if (currentElement && currentElement.length > 0) {
        if (isRootDirectory(currentElement)) {
            return '';
        } else {
            var pathArray = getMainDirectory(currentElement, []);
            var path = '';
            for (var i = pathArray.length - 1; i >= 0; i--) {
                path += '/' + pathArray[i] ;
            }
            return path;
        }
    }
}

function getMainDirectory(element, path) {
    var parent = element.parent().closest('li');
    if (parent.length > 0 && !element.is(parent)) {
        path.push(getDirectoryData(element).name);
        return getMainDirectory(parent, path);
    } else {
        path.push(getDirectoryData(element).name);
        return path;
    }
}

function getDirectoryData(liElement) {
    var dir_name = liElement.find('> div').attr('id');
    if (dir_name) return directoriesData[dir_name];
}

function childDirOpen(liElement) {
    return (liElement.find('ul').length > 0);
}

function addRootDirTo(directoryUlElement) {
    var rootDir = {id : '-root-', name : "..", path: ""};
    directoriesData[rootDir.id] = rootDir;

    var li = getDirectoryElement(rootDir);
    directoryUlElement.append($(li));
}

function getDirectoryElement(directory) {
    return '<li tabindex="1" >' +
    '<div id="' + directory.id + '">' +
    '<i class="fa fa-folder"></i>' +
    '<span class="editable">' + directory.name + '</span>' +
    '</div>' +
    '</li>';
}

function getNewDirectoryElement(directory) {
    return '<li tabindex="1" >' +
    '<div>' +
    '<i class="fa fa-folder"></i>' +
    '<input value="untitled"/>' +
    '</div>' +
    '</li>';
}

function getRootDirectory() {
    return element.getDirectories().find('#-root-').closest('li');
}

function isRootDirectory() {
    return (getCurrentDirectoryData().id == '-root-');
}

module.exports = directory;

},{"../handlers/handler.js":4,"../helpers/element.js":5,"../helpers/util.js":6}],9:[function(require,module,exports){
var util = require('../helpers/util.js');
var element = require('../helpers/element.js');
var reqHandler = require('../handlers/handler.js');

var disks = {};
var defaultPathParam = {
    relative : true
};
var defaultSearch = false;
/**
 * Constructor for Disk.
 *
 * @returns {{loadDisks: loadDisks, noDiskSetup: noDiskSetup, getCurrentDisk: getCurrentDisk, getRootPath: getRootPath}}
 */

function disk() {
    return {
        loadDisks : loadDisks,
        noDiskSetup : noDiskSetup,
        getCurrentDisk : getCurrentDisk,
        getRootPath : getRootPath
    };
}

/**
 * Load Disks as nav bar from user defined disk data.
 *
 * @param diskData
 */
function loadDisks(diskData) {

    addDisksElements();
    reqHandler.attachDiskElementEvents();

    function addDisksElements() {

        var diskElement = element.getDiskDropdown();
        diskElement.empty();
        disks = {};
        for (var i=0, len=diskData.length; i < len; i++) {
            var disk = diskData[i];
            disk.id = 'disk_' + util.slugify(disk.name);
            diskElement.append($(getDiskNavElement(diskData[i])));
            disk.path = disk.path || defaultPathParam;
            disks[disk.id] = disk;
        }
        diskElement.find("option:first").attr('selected','selected');
    }

    function getDiskNavElement(disk) {

        return '<option id="'+disk.id+'" value="'+disk.id+'">' + disk.label + '</option>';
    
    }

}

/**
 * Default disk setup.
 *
 * @param object
 */
function noDiskSetup(object) {

    disks = {
        disk_1 : {
            id : 'disk_1',
            search : object.search || defaultSearch,
            path : object.path || defaultPathParam
        }
    };
}

/**
 * Get currently selected disk data.
 *
 * @returns {*}
 */
function getCurrentDisk() {
    
    var selectedDisk = element.getDiskDropdown().find('option:selected').attr('id');
    if (selectedDisk) {
        return disks[selectedDisk];
    } else {
        return disks['disk_1'];
    }
}

/**
 * Return root path for the disk.
 *
 * @returns {*}
 */
function getRootPath() {

    var currentDisk = getCurrentDisk();
    if (currentDisk) {
        var relative = currentDisk.path.relative;
        var root = currentDisk.path.root;
        var cookie = currentDisk.path.cookie;
        if (root && root != '') {
            return root;
        } else if (relative == true) {
            return currentDisk.name;
        } else if (cookie && cookie != '') {
            return util.getCookie(cookie);
        }
    }
}

module.exports = disk;
},{"../handlers/handler.js":4,"../helpers/element.js":5,"../helpers/util.js":6}],10:[function(require,module,exports){
var element = require('../helpers/element.js');
var util = require('../helpers/util.js');
var reqHandler = require('../handlers/handler.js');

function file() {

    var directory_files_array = [];
    var current_files_array = [];

    var currentView = 'grid';

    /**
     * Load all files in the file browser window for a clicked directory.
     *
     * @param data
     */
	function loadFiles(data) {
        currentView = currentView || 'grid';
        directory_files_array = data;
        showFiles();
    }

    // Show files function can be called when we click on the directory or
    // when we search a file
    function showFiles(filesArray) {
        resetFiles();
        current_files_array = (filesArray) ? filesArray : JSON.parse(JSON.stringify(directory_files_array));
        loadFileList(current_files_array);
        loadFileGrid(current_files_array);
        show();
        reqHandler.attachFileEvents();
         

        function loadFileGrid(filesArray) {
            var rootPath = reqHandler.getRootPathForCurrentDir();

            var gridMetaData = fileWindowMetaData(true);
            gridMetaData.length = filesArray.length;
            attachScrollEventToFileWindow(filesArray, gridMetaData, loadGridImages);

            for (var i=0; i < gridMetaData.length; i++) {
                loadGridImages(i);
            }

            function loadGridImages(i) {
                var file = filesArray[i];
                if (file) {
                    file.id = util.slugify(file.name);
                    var gridElements = '<li id="'+file.id+'" tabindex="1"><div>';
                    file.type = file.type || util.getFileType(file.name);

                    var path = reqHandler.getAbsolutePath(file, rootPath);

                    gridElements += (util.isImage(file.type)) ? '<img src="' + path + '" alt="' + file.name + '"/>'
                        :
                    '<i class="big-icon fa ' + util.getFontAwesomeClass(file.type) + ' fa-3x"></i>';
                    gridElements += '<div>' + file.name + '</div>';

                    gridElements += '</li>';
                    element.getFilesGrid().append($(gridElements));
                }

            }

        }

        function loadFileList(filesArray) {
            var rootPath = reqHandler.getRootPathForCurrentDir();
            appendFileHeader();
            var tableBody = element.getFilesList().find('tbody');

            var listMetaData = fileWindowMetaData(false);
            listMetaData.length = filesArray.length;
            // TODO Need to fix the issue of lazy loading in file list
            // attachScrollEventToFileWindow(filesArray, listMetaData, loadListImages);

            for (var i=0, len = listMetaData.length; i < len; i++) {
                loadListImages(i);
            }

            function loadListImages(i) {
                var file = filesArray[i];
                if (file) {
                    file.id = util.slugify(file.name);
                    file.type = file.type || util.getFileType(file.name);
                    var path = reqHandler.getAbsolutePath(file, rootPath);

                    var listElements = '<tr id="'+file.id+'" tabindex="1">';

                    for (var key in reqHandler.getFileResponseParams()) {
                        listElements += '<td>';
                        if (key == 'name') {
                            listElements += (util.isImage(file.type)) ? '<img src="' + path + '" alt="' + file.name + '"/>'
                                :
                            '<i class="small-icon fa ' + util.getFontAwesomeClass(file.type) + '"></i>';
                        }
                        listElements += file[key];
                        listElements += '</td>';
                    }

                    listElements += '</tr>';

                    tableBody.append($(listElements));
                }
            }

            function appendFileHeader() {
                var headerElement = $('<thead></thead>');
                var rowElement = $('<tr></tr>');
                var thElement = '';
                for (var key in reqHandler.getFileResponseParams()) {
                    thElement += '<th id="'+key+'">' + reqHandler.getFileResponseParams()[key] + '<span></span></th>';
                }
                rowElement.append($(thElement));
                headerElement.append(rowElement);

                element.getFilesList().append(headerElement);
                element.getFilesList().append($('<tbody></tbody>'));
                element.getFilesList().find('thead').find('th').click(function(){
                    var isAsc = $(this).hasClass('asc');
                    sortFilesBy($(this).attr('id'), !isAsc);
                });
            }
        }


        function attachScrollEventToFileWindow(filesArray, metaData, loadImageCallBack) {
            if (metaData.stepUpNumber != 0 && filesArray.length > metaData.stepUpNumber) {
                metaData.length = metaData.stepUpNumber;

                element.getFileWindow().unbind('scroll');
                element.getFileWindow().scroll(function(e){
                    var numberOfImagesViewed = lastImageInViewPort(metaData);
                    if (filesArray.length > metaData.length) {
                        if (numberOfImagesViewed > metaData.length - metaData.numberX * metaData.numberY){
                            for (var i=Math.round(metaData.length); i < metaData.length + metaData.stepUpNumber || i < filesArray.length; i++) {
                                loadImageCallBack(i);
                            }
                            metaData.length = metaData.length + metaData.stepUpNumber;
                        }
                    } else {
                        element.getFileWindow().off('scroll');
                    }
                });
            }
        }

        function fileWindowMetaData(isGrid) {
            var metaData = {};

            var fileWindow = element.getFileWindow();
            var imgBlockHeight, imgBlockWidth;
            if (isGrid) {
                metaData.height = 104;
                metaData.width = 120;
            } else {
                metaData.width = fileWindow.width();
                metaData.height = 37;
            }

            if (fileWindow.width() >= metaData.width) {
                //Number of images in a row
                metaData.numberX = fileWindow.width()/metaData.width;

                //Number of rows in a view
                metaData.numberY = fileWindow.height()/metaData.height;

                //Number of images to be loaded in one step
                metaData.stepUpNumber = metaData.numberX * (metaData.numberY + 1);
            } else {
                metaData.stepUpNumber = 0;
            }

            return metaData;
        }

        function lastImageInViewPort(metaData) {
            var fileWindow = element.getFileWindow();

            var position = fileWindow.scrollTop();

            return (position/metaData.height + metaData.numberY) * metaData.numberX;
        }

        function show() {
            if (currentView == 'grid') {
                element.show(element.getFilesGrid());
            } else {
                element.show(element.getFilesList());
            }
        }

        function resetFiles() {
            element.getFilesGrid().empty();
            element.getFilesList().empty();

            element.hide(element.getFilesGrid());
            element.hide(element.getFilesList());
        }

    }

    /**
     * Show files as list and grid.
     */
    function showFileList() {
        currentView = 'list';
        element.hide(element.getFilesGrid());
        element.show(element.getFilesList());
    }

    function showFileGrid() {
        currentView = 'grid';
        element.show(element.getFilesGrid());
        element.hide(element.getFilesList());
    }

    /**
     * Sort files by selected type.
     *
     * @param type
     * @param isAsc
     */
    function sortFilesBy(type, isAsc) {
        isAsc = (typeof(isAsc) == "undefined") ? true : isAsc;

        cleanUpView(true);
        if (type == '') {
            showFiles();
            updateAscDescOrderClass();
        } else {
            var sortedFiles = util.sortByType(current_files_array, type, isAsc);
            showFiles(sortedFiles);
            updateAscDescOrderClass();
        }

        function updateAscDescOrderClass()
        {
            element.getFilesList().find('th').each(function(){
                var element = $(this);
                element.removeClass('asc').removeClass('desc');
                if (element.attr('id') == type && type != '') {
                    (isAsc) ? element.addClass('asc') : element.addClass('desc');
                    return false;
                }
            });
        }

    }


    /**
     * Search files.
     *
     * @param text
     */
    function searchFiles(text) {
        var searchedFiles = [];
        for (var i=0, len = directory_files_array.length; i < len; i++) {
            var file = directory_files_array[i];
            if (file.name.toLowerCase().indexOf(text.toLowerCase()) > - 1) {
                searchedFiles.push(file);
            }
        }
        showFiles(searchedFiles);
    }

    /**
     * Show and hide file details.
     *
     * @param file
     */
    function showFileDetails(file) {
        var fileDetails = element.getFileDetailsDiv();
        fileDetails.empty();
        element.show(fileDetails);
        for (var key in reqHandler.getFileResponseParams()) {
            fileDetails.append($(getFileDetailElement(reqHandler.getFileResponseParams()[key], file[key])));
        }

        function getFileDetailElement(key, value) {
	    	return '<li>' + 
	    	'<label>'+key+':&nbsp;</label>' +
	    	'<span>'+value+'</span>' + 
	    	'<span>&nbsp;</span>' + 
	    	'</li>'
	    }
    }

    function hideFileDetails() {
        var fileDetails = element.getFileDetailsDiv();
        fileDetails.empty();
        element.hide(fileDetails);
    }


    /**
     * Get current file element and details.
     *
     * @returns {*}
     */
    function getCurrentFileDetails() {

        var fileList = (currentView =='list') ? element.getFilesList() : element.getFilesGrid();
        var fileElement = fileList.find('.active');
        var id = fileElement.attr('id');
        for (var i=0, len = current_files_array.length; i < len; i++) {
            var file = current_files_array[i];
            if (file.id == id) {
                return file;
            }
        }
        return {};
    }

    function getCurrentFileElement() {

        var fileList = (currentView =='list') ? element.getFilesList() : element.getFilesGrid();
        return fileList.find('.active');
    }

    function cleanUpView(fromSort) {

        if (!fromSort) {
            element.getSortFilesDropdown().val('');
        }
        element.unselect(getCurrentFileElement());
        hideFileDetails();
        element.hide(element.getFileManageMenu());

    }

    function focusFirstElement() {
        var firstElement;
        if (currentView == 'list') {
            firstElement = element.getFilesList().find('tbody > tr:first-child');
        } else {
            firstElement = element.getFilesGrid().find('li:first-child');
        }

        firstElement.click();
        firstElement.focus();
    }

    function addFileOnUpload(file) {
        directory_files_array.push(file);
        showFiles();
    }


    return {
    	loadFiles : loadFiles,
        showFiles : showFiles,
        showFileList : showFileList,
        showFileGrid : showFileGrid,

        searchFiles : searchFiles,
        sortFilesBy : sortFilesBy,

        showFileDetails : showFileDetails,
        hideFileDetails : hideFileDetails,

        getCurrentFileDetails : getCurrentFileDetails,
        getCurrentFileElement : getCurrentFileElement,

        cleanUpView : cleanUpView,
        focusFirstElement: focusFirstElement,
        addFileOnUpload: addFileOnUpload
        
    };
}
module.exports = file;
},{"../handlers/handler.js":4,"../helpers/element.js":5,"../helpers/util.js":6}]},{},[1]);
