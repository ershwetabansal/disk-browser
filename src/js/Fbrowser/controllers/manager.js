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

	function doInitialSetup() {
		requestHandler.setupHandlers(new DiskHandler(),
			new DirHandler(), new FileHandler(), eventHandler);
		requestHandler.setupParameters(disksParam, directoriesParam, filesParam, httpParam, authParam);
		requestHandler.setupElementsAndEvents();
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