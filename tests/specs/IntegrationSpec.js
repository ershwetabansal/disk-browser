var stub = require('../helpers/stub.js');
var setup = require('../helpers/setup.js');
var element = require('../../src/js/Fbrowser/helpers/element.js');
var requestHandler = require('../../src/js/Fbrowser/handlers/handler.js');
var Manager = require('../../src/js/Fbrowser/controllers/manager.js');

var dirHandler, fileHandler, diskHandler;
describe("File browser should be able to manage disks, directories and files. User", function() {

    var setupObject;
    beforeEach(function() {

        stub.setUpHTMLFixture();
        element.getFileWindow().width(500);
        element.getFileWindow().height(500);

        setupObject = JSON.parse(JSON.stringify(stub.getSetupObject()));

        var manager = new Manager(setupObject);
        if (manager.validateSetupObject()) {
            manager.doInitialSetup(true);

            // Spy on the ajax and mock the call to pass mocked response
            spyOn($, 'ajax').and.callFake(function(object){

                return {
                    success : function (callback) {
                        if (object.url == setupObject.directories.list) {
                            if (object.data.path == '/') {
                                callback(stub.getDirectoryData(object.data.disk));
                            } else {
                                callback(stub.getSubDirectoryData(object.data.path.substr(1), object.data.disk));
                            }
                        }

                        if (object.url == setupObject.files.list) {
                            if (object.data.path == '/') {
                                callback(stub.getFilesData('--root--', object.data.disk));
                            } else {
                                callback(stub.getFilesData(object.data.path.substr(1), object.data.disk));
                            }
                        }
                        
                        if (object.url == setupObject.directories.create) {
                            callback({success: true, directory: {name: object.data.name, path: object.data.path}});
                        }
                        
                        if (object.url == setupObject.disks.search_URL) {
                            callback(stub.getSearchResults());
                        }

                        if (object.url == setupObject.files.upload.url) {
                            callback(stub.getUploadedFile());
                        }

                        return {
                            fail: function () {
                            }
                        }
                    }
                }
            });

            // When we load file browser
            manager.load({
                button : {
                    text : 'Update URL',
                    onClick : function(path) {
                        $('#path_input_box').val(path);
                    }
                }
            });

            // We have three disks to manage
            // 1) images
            // 2) documents
            // 3) restricted
            //
            // We have following directory structure in disk 'images'
            // Root
            //      cats[3 files, 2 directories]
            //          cute[1 file]
            //              cute cat.jpg
            //          angry[1 file]
            //              angry cat.jpg
            //          Black cat.jpg
            //          Kitten.jpg
            //          Fat cat.jpg
            //          Cat like dog.jpg
            //      dogs[2 files, 0 directories]
            //          Black dog.jpg
            //          White dog.jpg
            //          Special breed.jpg
            //      monkeys[0 file, 0 directory]
            //      Animal.jpg
            //
            // We have following directory structure in disk 'documents'
            // Root
            //      2016[5 directories]
            //          01
            //              2016_01_01.docx
            //              2016_01_02.docx
            //          02
            //              2016_02_01.docx
            //          03
            //          04
            //          05
            //      2015[12 directories]
            //          01
            //              2015_01_01.docx
            //          02
            //              2015_02_01.docx
            //          03
            //              2015_03_01.docx
            //          04
            //          05
            //          06
            //          07
            //          08
            //          09
            //          10
            //          11
            //          12

        }


    });

    afterEach(function () {
        document.body.innerHTML = '';
        element.flush();
    });

    it("opens a file browser window with disks and directories.", function () {

        // When we load file browser

        // Then we see that disks have been loaded in the dropdown
        expect(element.getDiskDropdown().find('option').length).toBeGreaterThan(0);

        // and there are two ajax calls
        expect($.ajax).toHaveBeenCalled();
        expect($.ajax.calls.count()).toBe(2);

        var arguments = $.ajax.calls.allArgs();

        // Where first ajax call should be for directories
        expect($.ajax.calls.allArgs()[0][0].url).toContain(setupObject.directories.list);

        // And second ajax call should be for files
        expect($.ajax.calls.allArgs()[1][0].url).toContain(setupObject.files.list);

        // Also directories and files should get loaded
        expect(element.getDirectories().find('li').length).toBeGreaterThan(0);
        expect(element.getFilesGrid().find('li').length).toBeGreaterThan(0);

    });

    it("clicks on a directory and corresponding files should list down.", function() {

        // When we load file browser
        // We see files corresponding to the root directory
        expect(element.getFilesGrid().find('> li').length).toBe(1);

        // When we click on the first directory 'cats'
        element.getDirectories().find('> li').eq(1).find('> div').click();

        // We see files present in cats folder
        expect(element.getFilesGrid().find('> li').length).toBe(4);
        var files = stub.getFilesData('cats');
        element.getFilesGrid().find('> li').each(function(index){
            expect(files[index].name).toBe($(this).find('> div').text());
        });

        // When we click on the second directory 'dogs'
        element.getDirectories().find('> li').eq(2).find('> div').click();

        // We see files present in dogs folder
        expect(element.getFilesGrid().find('> li').length).toBe(3);
        var files = stub.getFilesData('dogs');
        element.getFilesGrid().find('> li').each(function(index){
            expect(files[index].name).toBe($(this).find('> div').text());
        });

    });

    it("opens any disk and should see directories in the root of that disk. On click of any directory, files will load.", function() {

        // When we load a browser

        // We see the first disk 'images' loaded in disk dropdown
        expect(element.getDiskDropdown().find('option').eq(0).attr('selected')).toBe('selected');
        expect(element.getDiskDropdown().find('option').eq(1).attr('selected')).not.toBeDefined();

        // And directories in the root of that disk will be listed in the file browser
        var directories = stub.getDirectoryData('images');
        element.getDirectories().find('> li').each(function(index){
            if (index != 0) {
                expect(directories[index - 1].name).toBe($(this).find('> div').text());
            } else {
                expect($(this).find('> div').text()).toBe('..');
            }
        });

        // When we select another disk 'documents'
        element.getDiskDropdown().find('option:first').attr('selected', false);
        element.getDiskDropdown().find('option').eq(1).attr('selected', 'selected').trigger('change');

        // We see directories from documents disk
        var directories = stub.getDirectoryData('documents');
        element.getDirectories().find('> li').each(function(index){
            if (index != 0) {
                expect(directories[index - 1].name).toBe($(this).find('> div').text());
            } else {
                expect($(this).find('> div').text()).toBe('..');
            }
        });

        var directory = element.getDirectories().find('> li').eq(1);

        // When we click on a directory from documents disk
        directory.find('> div').click();

        // We see sub directories for that directory
        expect(directory.find('ul > li').length).toBe(5);

        // And we see that there is no file present in this directory
        expect(element.getFilesGrid().find('> li').length).toBe(0);

        // When we select a sub directory
        var subDirectory = directory.find('ul > li').eq(0);
        subDirectory.find('> div').click();

        // We see files corresponding to this sub directory
        expect(subDirectory.find('ul > li').length).toBe(0);

        // And there is no directory inside this sub directory
        expect(element.getFilesGrid().find('> li').length).toBe(2);
        var files = stub.getFilesData('2016/01', 'documents');
        element.getFilesGrid().find('> li').each(function(index){
            expect(files[index].name).toBe($(this).find('> div').text());
        });

    });

    it("can create a new directory.", function() {

        // When we click on 'New folder' button
        element.getCreateNewDirectory().click();

        // We see that there is one input field added to the directory list
        var inputElement = element.getDirectories().find('input');
        expect(inputElement.length).toBe(1);

        // And the value inside that input field is 'Untitled'
        expect(inputElement.val()).toBe('untitled');

        // When we do not change the folder name inside that input field
        inputElement.focusout();

        // input field stays as is, because 'untitled' name is not allowed
        inputElement = element.getDirectories().find('input');
        expect(inputElement.val()).toBe('untitled');

        // When user changes the name of the folder
        inputElement.val('New folder');
        inputElement.focusout();

        // We see that new directory is created
        inputElement = element.getDirectories().find('input');
        expect(inputElement.length).toBe(0);
        expect(element.getDirectories().find('> li').length).toBe(5);
        var newDirectory = element.getDirectories().find('> li').eq(4);
        expect(newDirectory.find('> div').text()).toBe('New folder');

        // We should be able to click on this new directory
        newDirectory.find('> div').click();

        // And there should not be any files and sub directories for this new directory
        expect(newDirectory.find('ul').length).toBe(0);
        expect(element.getFilesGrid().find('li').length).toBe(0);
        
    });

    it("can upload a file in a directory.", function() {

        var numberOfFilesBeforeUpload = element.getFilesGrid().find('li').length;

        // When we upload  a file
        element.getUploadFileInput().trigger('change');
        element.getUploadFileToServerBtn().click();

        // We see that the number of files has been increase by 1
        var numberOfFilesAfterUpload = element.getFilesGrid().find('li').length;

        expect(numberOfFilesAfterUpload).toBe(numberOfFilesBeforeUpload + 1);

    });

    it("selects a file and its details should be visible.", function() {
        // When we load a file browser

        // We do not see a button to get the path from the browser
        expect(element.getPrimarySubmitButton().attr('class')).toContain('hidden');

        // When we select a file
        element.getFilesGrid().find('li').eq(0).click();

        // The button appears element.getPrimarySubmitButton()on the screen
        expect(element.getPrimarySubmitButton().attr('class')).not.toContain('hidden');

        // And on clicking that button
        element.getPrimarySubmitButton().click();

        // Requested input box is filled with the path
        expect($('#path_input_box').val()).toBe('/dogs_cats_monkeys.jpg');
    });

    it("can search a file in a disk.", function() {
        
        // when we load a file browser
        
        // We click on the 'dog' directory
        element.getDirectories().find('>li').eq(2).find('> div').click();
        expect(element.getFilesGrid().find('li').length).toBe(3);

        // And we search a word 'dog'
        element.getSearchInput().val('dog');
        element.getSearchBtn().click();
        
        // First all the files with the word dog in that directory are listed down
        expect(element.getFilesGrid().find('li').length).toBe(2);
        
        // When we click on 'images' disk
        $('#search_images').click();

        // We see all the files listed in images disk
        expect(element.getFilesGrid().find('li').length).toBe(3);
        var searchedFiles = stub.getSearchResults().files;
        element.getFilesGrid().find('li').each(function(index){
           expect(searchedFiles[index].name).toBe($(this).text());
        });

    });


    it("can browse files in only specified allowed directories while others can not be browsed", function() {

        // Given that a setup has been done to allow browsing only few directories from a restricted disk

        var allowedDirectories = ['/images', '/2016/images', '/2015/images'];

        // When we load a browser

        // And go to the third disk which is a restricted disk
        element.getDiskDropdown().find('option').eq(2).attr('selected', 'selected').trigger('change');

        // We see directories from documents disk
        var directories = stub.getDirectoryData('restricted');
        console.log(directories);
        element.getDirectories().find('> li').each(function(index){
            if (index > 0 ) console.log(directories[index - 1]);
            checkFilesExpecation($(this), (index == 0) ? '..' : directories[index - 1].path, (index == 0) ? '..' : directories[index - 1].name);

        });

        function checkFilesExpecation(directory, path, name) {
            var fullPath = path + name;
            directory.find('> div').click();

            if (allowedDirectories.indexOf(fullPath) != -1) {
                console.log("allowed path :"+fullPath);
                expect(element.getFilesGrid().find('> li').length).toBeGreaterThan(0);
            } else {
                expect(element.getFilesGrid().find('> li').length).toBe(0);
            }

            directory.find('ul > li').each(function(index) {
                var subDirectories = stub.getSubDirectoryData(name, 'restricted');
                console.log(subDirectories[index]);
                checkFilesExpecation($(this), subDirectories[index].path, subDirectories[index].name);
            });

            directory.find('> div').click();
        }

    });
});