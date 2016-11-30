var element = require('../helpers/element.js');
var util = require('../helpers/util.js');

var diskHandler, dirHandler, fileHandler, eventHandler;
var disksParam = {}, directoriesParam = {}, filesParam = {}, httpParams = {}, authParams = {}, modalBoxParams = {},
    savedDiskParam = [];

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
				if (param.show_if) {
					$('#'+param.show_if).on('change', function () {
						var target = $('#'+param.id);
						if ($(this).prop('checked')) {
							target.removeClass('hidden');
							target.attr('required', true);
							target.get(0).focus();
						} else {
							target.addClass('hidden');
							target.removeAttr('required');
						}
					});

				}
			}
		}
	}

	function getFormElement(param) {
		if (param.type == 'checkbox') {
			return '<label style="margin-left: 15px;" class="control-label"><input id="'+param.id+'" type="checkbox" '+
				(param.value ? ' checked ' : '' ) +
				'style="margin-right: 10px;"' + (param.name ? 'name="'+param.name+'"' : '') + '/>' + param.label +'</label>';
		}

		return '<input style="margin-left: 15px;" id="'+param.id+'" type="'+ (param.type ? param.type : 'text') +
			'" placeholder="'+param.label+'" ' +
			'name="'+param.name+'" ' +
			'class="form-control '+ (param.class ? param.class : '')+'" ' + (param.required && param.class != "hidden" ? 'required' : '')+ ' />'
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

    if (element.getDirectories().find('li').length == 0 ||
        savedDiskParam != modalBoxParameters.disks) {
		loadDisks(modalBoxParameters);
	}
}

function showHideDisks(modalBoxParameters) {

    element.getDiskDropdown().find('option').each(function() {
        if (modalBoxParameters.disks &&
            modalBoxParameters.disks.length > 0 &&
            modalBoxParameters.disks.indexOf($(this).text()) == -1) {
            $(this).remove();
        }
    });

    savedDiskParam = modalBoxParameters.disks;
}

function loadDisks(modalBoxParameters) {
	if (disksParam && disksParam.details && disksParam.details.length > 0) {
		diskHandler.loadDisks(disksParam.details);
	} else {
        diskHandler.noDiskSetup(disksParam);
    }

    showHideDisks(modalBoxParameters);
    loadDirectories();
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
function getEventHandler() {
	return eventHandler;
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
		hideError();
    }).fail(function (response) {
        if (failureCallback) {
			failureCallback(response);
		}

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

    var message = response.statusText;

	if (httpParams.error && response.status == 422) {
        message = httpParams.error(response.status, JSON.parse(response.responseText)) || message;
    }

	showError(message);
}

function showError(message) {
	element.show(element.getErrorMessagePlaceHolder());
	element.getErrorMessagePlaceHolder().find('div').text(message);
}

function hideError() {
	element.hide(element.getErrorMessagePlaceHolder());
	element.getErrorMessagePlaceHolder().find('div').text('');
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

    var rootDirectoryPath = diskHandler.getRootDirectory();
	if (rootDirectoryPath) {
		params.path = rootDirectoryPath + (params.path =='/' ? '' : params.path) ;
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
    getEventHandler: getEventHandler,

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
    updateButtonDetails : updateButtonDetails,

	showError: showError,
	hideError: hideError
};