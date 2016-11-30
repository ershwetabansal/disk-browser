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

        // We see the first disk in the dropdown is selected
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


    it("can browse files in only specified allowed directories while others are hidden from the view.", function() {

        // Given that a setup has been done to allow browsing only few directories from a restricted disk

        // images               - should not be allowed
        // 2016                 - should be allowed
        //      images          - should be allowed
        //      documents       - should be allowed
        // 2015                 - should not be allowed
        //      images          - should be allowed
        //      documents       - should not be allowed

        var allowedDirectories = ['/2016', '/2015'];

        // When we load a browser

        element.getDirectories().empty();

        // And go to the third disk which is a restricted disk
        element.getDiskDropdown().find('option').eq(2).attr('selected', 'selected').trigger('change');
        // We see only allowed directories from restricted disk
        var directories = stub.getDirectoryData('restricted');

        element.getDirectories().find('> li').each(function(index){

            if (allowedDirectories.indexOf('/' + $(this).find('> div').text()) != -1) {
                expect($(this).find('> div').hasClass('hidden')).toBeFalsy();
            } else {
                expect($(this).find('> div').hasClass('hidden')).toBeTruthy();
            }

            checkFilesExpectation($(this),
                (index == 0) ? '/' : directories[index - 1].path,
                (index == 0) ? $(this).find('> div').text() : directories[index - 1].name,
                false);

        });
        

        function checkFilesExpectation(directory, path, name, allowByDefault) {
            var fullPath = path + name;
            directory.find('> div').click();

            var isAllowed = false;
            if (allowedDirectories.indexOf(fullPath) != -1 || allowByDefault) {
                expect(element.getFilesGrid().find('> li').length).toBeGreaterThan(0);
                isAllowed = true;
            } else {
                expect(element.getFilesGrid().find('> li').length).toBe(0);
            }

            directory.find('ul > li').each(function(index) {
                var subDirectories = stub.getSubDirectoryData(name, 'restricted');
                if (subDirectories[index]) {
                    checkFilesExpectation($(this), subDirectories[index].path, subDirectories[index].name, isAllowed);
                }
            });

            directory.find('> div').click();
        }

    });


    it("can see files only with defined extensions.", function() {

        // Given that a setup has been done to allow only images

        var allowedExtensions = ['png', 'jpg', 'jpeg'];

        // When we load a browser

        // And go to the fourth disk which is a onlyImages disk
        element.getDiskDropdown().find('option').eq(3).attr('selected', 'selected').trigger('change');

        // We see directories from onlyImages disk
        var directories = stub.getDirectoryData('restricted');
        element.getDirectories().find('> li').each(function(index){
            return checkFilesExpectation($(this), (index == 0) ? '..' : directories[index - 1].name, allowedExtensions, 'restricted');
        });

        // Also there is another setup where we want to allow only documents

        allowedExtensions = ['doc', 'docx'];
        // And go to the fifth disk which is a onlyDocs disk
        element.getDiskDropdown().find('option').eq(4).attr('selected', 'selected').trigger('change');

        // We see directories from onlyDocs disk
        directories = stub.getDirectoryData('restricted');
        element.getDirectories().find('> li').each(function(index){
            return checkFilesExpectation($(this), (index == 0) ? '..' : directories[index - 1].name, allowedExtensions, 'restricted');
        });


        function checkFilesExpectation(directory, name, allowedExtensions, diskName) {
            directory.find('> div').click();

            element.getFilesGrid().find('> li').each(function() {
               expect(allowedExtensions.indexOf(getExtension($(this).text()))).not.toBe(-1);
            });

            directory.find('ul > li').each(function(index) {
                var subDirectories = stub.getSubDirectoryData(name, diskName);
                if (subDirectories[index]) {
                    return checkFilesExpectation($(this), subDirectories[index].name, allowedExtensions, diskName);
                }
            });

            directory.find('> div').click();
            return true;
        }

        function getExtension(fileName) {
            var array = fileName.split('.');
            if (array != null && array.length == 2) {
                return array[1];
            }

            return '';
        }

    });


    it("can not upload a file to the read only disk.", function() {

        // Given that a setup has been done to have a read only disk

        // When we load a browser

        // And go to the sixth disk which is a readOnly disk
        element.getDiskDropdown().find('option').eq(5).attr('selected', 'selected').trigger('change');

        // We see that files can not be uploaded to this disk.
        expect(element.getUploadFileBtn().hasClass('hidden')).toBeTruthy();

        // And there is no way to create a new folder
        expect(element.getCreateNewDirectory().hasClass('hidden')).toBeTruthy();

        // TODO We see that none of the directories can be deleted

        // TODO None of the files can be deleted

    });


    it("can browse files in only specified root directory while others are hidden from the view.", function() {

        // Given that a setup has been done to allow browsing only few directories from a restricted disk

        // images               - should not be allowed
        // 2016                 - should be allowed
        //      images          - should be allowed
        //      documents       - should be allowed
        // 2015                 - should not be allowed
        //      images          - should be allowed
        //      documents       - should not be allowed

        var root_directory_path = '/2016/images';

        // When we load the disk browser
        element.getDirectories().empty();

        // And go to the fourth disk which is a ImageRoot disk
        element.getDiskDropdown().find('option').eq(6).attr('selected', 'selected').trigger('change');

        var directories = stub.getSubDirectoryData('2016/images', 'restricted');

        // We should see the directory declared in root path and its first level sub directories
        expect(element.getDirectories().find('> li').length).toBe(directories.length + 1);
        element.getDirectories().find('> li').each(function(index) {
            if (index == 0) {
                expect($(this).find('> div').text()).toBe('..');
            } else {
                expect($(this).find('> div').text()).toBe(directories[index - 1].name);
            }
        });

    });

    it("can not upload a file in the root if configured so.", function() {

        // Given that a setup has been done to allow browsing only few directories from a restricted disk

        // images               - should not be allowed
        // 2016                 - should be allowed
        //      images          - should be allowed
        //      documents       - should be allowed
        // 2015                 - should not be allowed
        //      images          - should be allowed
        //      documents       - should not be allowed

        // When we load the disk browser
        element.getDirectories().empty();

        // And go to the fourth disk which is a read only root disk
        element.getDiskDropdown().find('option').eq(7).attr('selected', 'selected').trigger('change');

        // We see that files can not be uploaded to root directory.
        expect(element.getUploadFileBtn().hasClass('hidden')).toBeTruthy();

        // But can create a folder inside this
        expect(element.getCreateNewDirectory().hasClass('hidden')).toBeFalsy();

        element.getDirectories().find('> li').eq(1).find(' > div').click();

        // We see that files can be uploaded to this directory.
        expect(element.getUploadFileBtn().hasClass('hidden')).toBeFalsy();

        // and can create a folder inside this
        expect(element.getCreateNewDirectory().hasClass('hidden')).toBeFalsy();


    });

    it("can displays a form input when configured for file upload.", function() {

        // Given that a setup has been done to send some upload parameters with a upload request

        // images               - should not be allowed
        // 2016                 - should be allowed
        //      images          - should be allowed
        //      documents       - should be allowed
        // 2015                 - should not be allowed
        //      images          - should be allowed
        //      documents       - should not be allowed

        // When we load the disk browser
        element.getDirectories().empty();

        // And go to the ninth disk which is image upload disk
        element.getDiskDropdown().find('option').eq(8).attr('selected', 'selected').trigger('change');

        // When we upload  a file
        element.getUploadFileInput().trigger('change');

        var aliasLabel = element.getUploadFileParameterContainer().find('input[type="text"]');
        var aliasCheckbox = element.getUploadFileParameterContainer().find('input[type="checkbox"]');
        expect(aliasLabel.length).toBe(1);
        expect(aliasCheckbox.length).toBe(1);

        expect(aliasLabel.hasClass('hidden')).toBeTruthy();
        expect(aliasCheckbox.prop('checked')).toBeFalsy();
        aliasCheckbox.prop('checked', true).trigger('change');

        expect(aliasLabel.hasClass('hidden')).toBeFalsy();
        element.getUploadFileParameterContainer().find('input[type="text"]').val('some_value');

        element.getUploadFileToServerBtn().click();

        var formData = $.ajax.calls.allArgs()[2][0].data;

        // Then we see that the form data contains the input value.
        expect(formData.has('url_alias_label')).toBeTruthy();


    });

});