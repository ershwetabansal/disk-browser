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
        isRootDirectory : isRootDirectory,
        getDirectoryPathFor : getDirectoryPathFor
        
    };
}

/**
 * Load directories and sub directories.
 *
 * @param data
 */
function loadDirectories(data) {
    directoriesData = {};
    addRootDirectories(element.getDirectories(), data);
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
            addDirectoriesElements(liElement.find('ul'), directories);
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
 * Add root directories.
 *
 * @param directoryUlElement
 * @param directories
 */
function addRootDirectories(directoryUlElement, directories)
{
    directoryUlElement.empty();

    var allowed_directories = reqHandler.getDiskHandler().getAllowedDirectories();

    // If allowed directories are given, then we assume that they are first level directories and
    // Load only the allowed once.
    if (allowed_directories) {
        addDirectoriesElements(directoryUlElement, directories, allowed_directories);
        return;
    }

    // Add a '..' root directory in the disk.
    var rootDir = {id : '-root-', name : "..", path: ""};
    directoriesData[rootDir.id] = rootDir;
    directoryUlElement.append($(getDirectoryElement(rootDir)));
    addDirectoriesElements(directoryUlElement, directories);
}
/**
 * Add a directory elements to the parent directory.
 *
 * @param directoryUlElement
 * @param directories
 * @param allowed_directories
 */
function addDirectoriesElements(directoryUlElement, directories, allowed_directories) {

    for (var i=0, len = directories.length; i < len; i++) {
        var directory = directories[i];
        if (!allowed_directories || allowed_directories.indexOf(directory.name) != -1) {
            directory.id = util.slugify(directory.name);
            var li = getDirectoryElement(directory);
            directoryUlElement.append($(li));

            directoriesData[directory.id] = directory;
        }
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
    return dirElement.find('input');
}

/**
 * Create a new directory under a root or any other directory.
 *
 * @returns {*}
 */
function addNewDirectoryToSelectedDirectory() {
    var selectedDir = getCurrentDirectoryElement();
    var parentDir;

    if (isRootDirectory()) {
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
}

function getCurrentDirectoryData() {
    return getDirectoryData(getCurrentDirectoryElement());
}

function getCurrentDirectoryPath() {
    var currentElement = getCurrentDirectoryElement();

    return getDirectoryPathFor(currentElement);
}

function getDirectoryPathFor(element) {

    if (element && element.length > 0) {
        if (isRootDirectory(element)) {
            return '';
        } else {
            var pathArray = getMainDirectory(element, []);
            var path = '';
            if (pathArray) {
                for (var i = pathArray.length - 1; i >= 0; i--) {
                    path += '/' + pathArray[i] ;
                }
            }
            return path;
        }
    }
}

function getMainDirectory(element, path) {
    var parent = element.parent().closest('li');
    var dirData = getDirectoryData(element);

    if (dirData) {
        if (parent.length > 0 && !element.is(parent)) {
            path.push(dirData.name);
            return getMainDirectory(parent, path);
        } else {
            path.push(dirData.name);
            return path;
        }
    }
}

function getDirectoryData(liElement) {
    var dir_name = liElement.find('> div').attr('id');
    if (dir_name) return directoriesData[dir_name];
}

function childDirOpen(liElement) {
    return (liElement.find('ul').length > 0);
}

function getDirectoryElement(directory) {
    return '<li tabindex="1" >' +
    '<div id="' + directory.id + '">' +
    '<i class="fa fa-folder"></i>' +
    '<span class="editable" data-path="'+directory.path+'">' + directory.name + '</span>' +
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

function isRootDirectory(liElement) {

    if (liElement) {
        return liElement.find('> div').attr('id') == '-root-';
    }

    return (getCurrentDirectoryData().id == '-root-');
}

module.exports = directory;
