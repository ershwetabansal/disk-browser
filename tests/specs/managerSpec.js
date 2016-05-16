var Manager = require('../../public/js/Fbrowser/controllers/manager.js');

describe("Test Manager functions", function() {

	it("should verify the setup object", function() {
		var setupObject = {};
		var manager = new Manager(setupObject);
    
        expect(manager.validateSetupObject()).toBe(false);

        setupObject = { disks : []};
		manager = new Manager(setupObject);
    
        expect(manager.validateSetupObject()).toBe(false);

        setupObject = { disks : [], directories : {list : '/assets'}, files : { list : '/assets'}};
		manager = new Manager(setupObject);
    
        expect(manager.validateSetupObject()).toBe(true);
    });

    
});