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
            var isDirectoryAllowed = reqHandler.getDiskHandler().isThisDirectoryAllowed(reqHandler.getDirHandler().getCurrentDirectoryPath());
            if (isDirectoryAllowed) {
                reqHandler.loadFiles();
            } else {
                reqHandler.getFileHandler().clearAllFiles();
            }
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