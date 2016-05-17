var stub = require('../helpers/stub.js');
var setup = require('../helpers/setup.js');
var element = require('../../src/js/Fbrowser/helpers/element.js');

var dirHandler, fileHandler, diskHandler;
describe("File browser should be able to manage disks, directories and files. User", function() {

    var browser = FileBrowser().getInstance();
    browser.setup({

        disks : {
            search : true,
            search_URL: 'http://file-browser.com/api/v1/disk/search',
            details : [
                {
                    //In case of cross origin disk
                    name: 'ea_images',
                    label: 'Images',
                    path : {
                        relative : true
                    }
                },
                {
                    //In case of cross origin disk
                    name: 'ea_publications',
                    label: 'Publications',
                    path : {
                        relative : true
                    }
                }
            ]
        },
        directories: {
            list: 'http://file-browser.com/api/v1/directories',
            create: 'http://file-browser.com/api/v1/directory/store',
            delete: '/api/v1/directory/destroy'
        },
        files: {
            list: 'http://file-browser.com/api/v1/files',
            upload: {
                url: 'http://file-browser.com/api/v1/file/store',
                params:[]
            },
            thumbnail: {
                show : true,
                directory : '/thumbnails',
                path : '',
                prefix : '',
                suffix : ''
            },
            size_unit : 'KB'
        },
        http : {
            headers : {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            error : function(status, response) {
                console.log(response);
                if (status == '422') {
                    for (var key in response) {
                        return response[key][0];
                    }
                }
                return 'Error encountered. ';
            }
        },
        authentication : "session"
    });

    beforeEach(function() {
        console.log("hello");

        stub.setUpHTMLFixture();

        // browser.openBrowser({
        //     context_menu: true,
        //     button : {
        //         text : 'Update URL',
        //         onClick : function(path) {
        //             console.log("path :"+path);
        //         }
        //     }
        // });

    });

    afterEach(function () {
        // element.closeModal();
    });

    it("opens a file browser window with disks and directories.", function (done) {

        // File browser modal box should contain class 'in' of bootstrap
        expect(element.getFileBrowser().attr('class')).toContain("in");

        expect(element.getDiskDropdown().find('option').length).toBeGreaterThan(0);

        setTimeout(function() {
            expect(element.getDirectories().find('li').length).toBeGreaterThan(0);
            done();
        },1000);

    });

    it("clicks on a directory and corresponding files should list down.", function(done) {

        // setTimeout(function() {
        //     done();
        // },1000);


    });

    it("opens any disk and should see directories. On click of a directory, files should load.", function(done) {

    });

    it("can create a new directory.", function() {

    });

    it("selects a file and its details should be visible.", function() {

    });

    it("can upload a file in a directory.", function() {

    });

    it("can search a file in a disk.", function() {

    });

    it("can delete a directory.", function() {

    });

    it("can sort files.", function() {

    });

    it("can refresh files.", function() {

    });

});