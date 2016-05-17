var stub = require('../helpers/stub.js');
var setup = require('../helpers/setup.js');
var element = require('../../src/js/Fbrowser/helpers/element.js');


describe("File browser should be able to manage files and ", function() {

	beforeEach(function() {
	
		stub.setUpHTMLFixture();
		setup.setupHandlers(stub.getSetupObject());
		setup.getFileHandler().loadFiles(stub.getFilesData());
    
    });
    
    it("should be able to load files when directory is selected.", function() {

    	expect(element.getFilesGrid().children.length).toBeGreaterThan(0); 	

    });

    it("should allow files to be aligned as a list.", function() {

    	setup.getFileHandler().showFileList();

    	expect(element.getFilesList().attr('class')).not.toContain('hidden');
    	expect(element.getFilesGrid().attr('class')).toContain('hidden');

    });

    it("should allow files to be aligned as a grid.", function() {

    	setup.getFileHandler().showFileGrid();

    	expect(element.getFilesList().attr('class')).toContain('hidden');
    	expect(element.getFilesGrid().attr('class')).not.toContain('hidden');

    });

    it("should allow files to be sorted as ascending.", function() {

    	setup.getFileHandler().showFileList();

    	var sizeOfFirstElementBeforeSort = element.getFilesList().find('tbody').find('tr').eq(0).find('td').eq(2).text();
    	setup.getFileHandler().sortFilesBy('size', true);
    	var sizeOfFirstElementAfterSort = element.getFilesList().find('tbody').find('tr').eq(0).find('td').eq(2).text();

    	expect(parseInt(sizeOfFirstElementBeforeSort)).toBeGreaterThan(parseInt(sizeOfFirstElementAfterSort));

    });

    it("should allow files to be sorted as descending.", function() {

    	setup.getFileHandler().showFileList();

    	var sizeOfFirstElementBeforeSort = element.getFilesList().find('tbody').find('tr').eq(0).find('td').eq(2).text();
    	setup.getFileHandler().sortFilesBy('size', false);
    	var sizeOfFirstElementAfterSort = element.getFilesList().find('tbody').find('tr').eq(0).find('td').eq(2).text();

    	expect(parseInt(sizeOfFirstElementAfterSort)).toBeGreaterThan(parseInt(sizeOfFirstElementBeforeSort));

    });

    it("should allow files to be searched.", function() {

    	var numberOfFilesBeforeSearch =  element.getFilesGrid().find('li').length;

    	setup.getFileHandler().searchFiles('cat');
    	
    	var numberOfFilesAfterSearch =  element.getFilesGrid().find('li').length;
    	
    	expect(numberOfFilesBeforeSearch).toBeGreaterThan(numberOfFilesAfterSearch);

    });

    it("should return the selected file details.", function() {

		setup.getFileHandler().showFileGrid();

		var fileElement = element.getFilesGrid().find('li').eq(0);
    	element.select(element.getFilesGrid(), fileElement);

		expect(setup.getFileHandler().getCurrentFileDetails().name).toBe(fileElement.text());

    });

    it("should show and hide selected file details.", function() {

    	//Select a file
    	var fileElement = element.getFilesGrid().find('li').eq(0);
    	element.select(element.getFilesGrid(), fileElement);

    	//Show the selected file details
    	var file = setup.getFileHandler().getCurrentFileDetails();
    	setup.getFileHandler().showFileDetails(file);
    	expect(element.getFileDetailsDiv().find('li').length).toBeGreaterThan(0);
		
		//Hide the selected file details
		setup.getFileHandler().hideFileDetails();
    	expect(element.getFileDetailsDiv().find('li').length).toBe(0);
    });

});

