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