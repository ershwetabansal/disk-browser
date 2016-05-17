var validate = require('../../src/js/Fbrowser/helpers/validate.js');

describe("Setup parameters should get validated. ", function() {

    it("should verify disk parameter", function() {
        var object = {};
        expect(validate.disksParam(object)).toBe(true);

        object = {
            disks : {
                search : true,
                multiple : [
                ]
            }
        };
        expect(validate.disksParam(object)).toBe(true);

        object = {
            disks : ''
        };
        expect(validate.disksParam(object)).toBe('disks parameter is of invalid type.');

        object = {
            disks : {
                search : true,
                details : [{
                    name : 'S3'
                }]
            }
        };
        expect(validate.disksParam(object)).toBe('details parameter does not contain mandatory field : label.');

        object = {
            disks : {
                search : true,
                details : [{
                    name : 'S3',
                    label : 'AWS S3'
                }]
            }
        };
        expect(validate.disksParam(object)).toBe(true);

    });

    it("should verify directory parameter", function() {
        var object = {};
        expect(validate.dirParam(object)).toBe('directories parameter is mandatory.');

        object = {
            directories : {}
        };
        expect(validate.dirParam(object)).toBe('directories parameter does not contain mandatory field : list.');

        object = {
            directories : { list : ''}
        };
        expect(validate.dirParam(object)).toBe('list should have a value');

    });

    it("should verify files parameter", function() {
        var object = {};
        expect(validate.filesParam(object)).toBe('files parameter is mandatory.');

        object = {
            files : {}
        };
        expect(validate.filesParam(object)).toBe('files parameter does not contain mandatory field : list.');

        object = {
            files : { list : ''}
        };
        expect(validate.filesParam(object)).toBe('list should have a value');

        object = {
            files : { list : '/assets'}
        };
        expect(validate.filesParam(object)).toBe(true);

        object = {
            files : { list : {}}
        };
        expect(validate.filesParam(object)).toBe('list parameter does not contain mandatory field : url.');

    });

    it("should verify http parameter", function() {
        var object = {};
        expect(validate.httpParam(object)).toBe(true);

        object = {
            http : {}
        };
        expect(validate.httpParam(object)).toBe(true);

    });


    it("should verify auth parameter", function() {
        var object = {};
        expect(validate.authParam(object)).toBe(true);

        object = {
            authentication : {}
        };
        expect(validate.authParam(object)).toBe("authentication parameter is of invalid type.");


        object = {
            authentication : "Something"
        };
        expect(validate.authParam(object)).toBe("authentication should have correct value");

    });

});