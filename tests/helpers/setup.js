var Disk = require('../../src/js/Fbrowser/model/disk.js');
var Directory = require('../../src/js/Fbrowser/model/directory.js');
var File = require('../../src/js/Fbrowser/model/file.js');

var handler = require('../../src/js/Fbrowser/handlers/handler.js');
var evHandler = require('../../src/js/Fbrowser/handlers/eventhandler.js');

var stub = require('../helpers/stub.js');

var diskHandler = new Disk();
var dirHandler = new Directory();
var fileHandler = new File();

function setupHandlers(setupObject) {
	handler.setupHandlers(diskHandler, dirHandler, fileHandler, evHandler);
	handler.setupParameters(setupObject.disks, setupObject.directories, setupObject.files);
}

function getFileHandler() {
	return fileHandler;
}

function getDirHandler() {
	return dirHandler;
}

function getDiskHandler() {
	return diskHandler;
}

function getHandler() {
	return handler;
}

function getEventHandler() {
	return evHandler;
}

module.exports = {
	setupHandlers : setupHandlers,

	getDiskHandler : getDiskHandler,
	getDirHandler : getDirHandler,
	getFileHandler : getFileHandler,
	getHandler : getHandler,
	getEventHandler : getEventHandler
}
