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
		alert("Please check console errors.");
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