var util = require('../../src/js/Fbrowser/helpers/util.js');

describe("Test Utility functions. ", function() {

    it("should slugify a string", function() {
        expect(util.slugify("Home page")).toBe("home_page");
    });

    it("should un-slugify a string", function() {
        expect(util.unSlugify("home_page")).toBe("Home page");
    });

    it("should check if the extension is for image", function() {
        expect(util.isImage('Image')).toBe(true);
        expect(util.isImage('Doc')).toBe(false);
    });

    it("should return the font awesome class based upon extension", function() {
        expect(util.getFontAwesomeClass('Image')).toBe('fa-file-image-o');
        expect(util.getFontAwesomeClass('Word')).toBe('fa-file-word-o');
    });

    it("should return the sorted array", function() {
        var unsorted = [
            { a : '5', b: 'something'},
            { a : '2', b: 'something'},
            { a : '3', b: 'something'},
            { a : '4', b: 'something'}
        ];

        var ascSorted = [
            { a : '2', b: 'something'},
            { a : '3', b: 'something'},
            { a : '4', b: 'something'},
            { a : '5', b: 'something'}
        ];

        var descSorted = [
            { a : '5', b: 'something'},
            { a : '4', b: 'something'},
            { a : '3', b: 'something'},
            { a : '2', b: 'something'}
        ];
        expect(util.sortByType(unsorted, 'a', true)).toEqual(ascSorted);
        expect(util.sortByType(unsorted, 'a', false)).toEqual(descSorted);
    });

    it("should return type of the file from extension", function() {

        expect(util.getFileType('assam.png')).toEqual('Image');
        expect(util.getFileType('assam.jpeg')).toEqual('Image');
        expect(util.getFileType('assam.jpg')).toEqual('Image');
        expect(util.getFileType('assam.gif')).toEqual('Image');
        expect(util.getFileType('assam.bmp')).toEqual('Image');
        expect(util.getFileType('assam.tiff')).toEqual('Image');

        expect(util.getFileType('assam.doc')).toEqual('Word');
        expect(util.getFileType('assam.docx')).toEqual('Word');

        expect(util.getFileType('assam.pdf')).toEqual('PDF');

        expect(util.getFileType('assam.xls')).toEqual('Excel');
        expect(util.getFileType('assam.xlsx')).toEqual('Excel');

    });
});