var stub = require('../helpers/stub.js');
var setup = require('../helpers/setup.js');
var element = require('../../public/js/Fbrowser/helpers/element.js');

describe("File browser should be able to manage disks and ", function() {

    beforeEach(function() {
        stub.setUpHTMLFixture();
        setup.setupHandlers(stub.getSetupObject());
    });

    it("should load disks when opens up", function() {
        setup.getDiskHandler().loadDisks(stub.getDiskData());
        expect(element.getDiskDropdown().find('option').length).toBeGreaterThan(0);
    });


});