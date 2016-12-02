var fbElement,
    primaryBtn,
    loadingBar,
    errorMessage,
    fileBrowserBody,

    diskDropdown,
    diskTypes,

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
    diskTypes = undefined;

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
        errorMessage.find('.close').click(function () {
           hide($('#' + $(this).data('dismiss')));
        });
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

function getDiskTypes() {
    if (!diskTypes || diskTypes.length == 0) {
        diskTypes= getFileBrowser().find('#disk-types');
    }

    return diskTypes;
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
    getDiskTypes: getDiskTypes,

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
