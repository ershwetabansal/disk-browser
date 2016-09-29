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
        getRootPath : getRootPath,
        getRootDirectory : getRootDirectory,
        isThisFileAllowed : isThisFileAllowed,
        getAllowedFilesFrom : getAllowedFilesFrom,
        isReadOnly: isReadOnly,
        isRootReadOnly: isRootReadOnly,
        getAllowedDirectories : getAllowedDirectories
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
            disk.id = 'disk_' + util.slugify(disk.label);
            diskElement.append($(getDiskNavElement(diskData[i])));
            disk.path = disk.path || defaultPathParam;
            disks[disk.id] = disk;
        }
        diskElement.find("option:first").attr('selected','selected');
    }

    function getDiskNavElement(disk) {

        return '<option id="'+disk.id+'" data-name="'+disk.name+'" value="'+disk.id+'">' + disk.label + '</option>';
    
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

/**
 * Return all the allowed directories on a given disk.
 *
 * @returns {Array}
 */
function getAllowedDirectories() {
    var currentDisk = getCurrentDisk();
    if (currentDisk) {
        return currentDisk.allowed_directories;
    }
}

/**
 * Return root directory if any.
 *
 * @returns {string}
 */
function getRootDirectory() {
    var currentDisk = getCurrentDisk();
    if (currentDisk) {
        return currentDisk.root_directory_path;
    }
}

function checkIfDirectoryParentAllowed(currentDisk, path) {

    var parentDirPath = path.substr(0, path.lastIndexOf('/'));

    if (parentDirPath == '') {
        return false;
    }

    return currentDisk.allowed_directories.indexOf(parentDirPath) != -1 || checkIfDirectoryParentAllowed(currentDisk, parentDirPath);
}

/**
 * Return all the files that are allowed for a given disk.
 *
 * @param fileArray
 * @returns {*}
 */
function getAllowedFilesFrom(fileArray) {

    var currentDisk = getCurrentDisk();

    var allowedFiles = [];
    for (var i = 0, len = fileArray.length; i < len; i++) {
        var file = fileArray[i];
        if (isThisFileAllowed(file.name, currentDisk)) {
            allowedFiles.push(file);
        }
    }

    return allowedFiles;
}

/**
 * Should we show a given file on the disk? It is decided based upon allowed_extensions array
 * on disk params.
 *
 * @param fileName
 * @returns {boolean}
 * @param currentDisk
 */
function isThisFileAllowed(fileName, currentDisk) {

    if (currentDisk.allowed_extensions && currentDisk.allowed_extensions.length > 0) {
        return currentDisk.allowed_extensions.indexOf(getExtension(fileName)) != -1;
    }

    return true;
}

/**
 * Is this disk read only?
 *
 * @returns {boolean}
 */
function isReadOnly() {

    return getCurrentDisk().read_only == true;
}

/**
 * Is root directory ready only for this disk?
 *
 * @returns {boolean}
 */
function isRootReadOnly() {

    return getCurrentDisk().root_read_only == true;
}

function getExtension(fileName) {
    var array = fileName.split('.');
    if (array != null && array.length == 2) {
        return array[1];
    }

    return '';
}

module.exports = disk;