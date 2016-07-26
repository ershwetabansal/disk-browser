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