var validation = {
	disks: {
		types : ['object'],
		required : [],
		optional : ['search', 'details', 'search_URL'],
		field_required : false
	},
	details: {
		types : ['array', 'object'],
		required : ['name', 'label'],
		optional : ['search_URL'],
		field_required : false
	},
	directories : {
		types : ['object'],
		required : ['list'],
		optional : ['destroy', 'upload', 'update'],
		field_required : true
	},
	files : {
		types : ['object'],
		required : ['list'],
		optional : ['destroy', 'upload', 'update', 'unit'],
		field_required : true
	},
	name : {
		types : ['string'],
		value : true
	},
	label : {
		types : ['string'],
		value : true,
	},
	list : {
		types : ['string', 'object'],
		required : ['url'],
		value : true
	},
	upload : {
		types : ['string', 'object'],
		required : ['url', 'params']
	},
	destroy : {
		types : ['string', 'object'],
		required : ['url']
	},
	update : {
		types : ['string', 'object'],
		required : ['url']
	},
	search : {
		types : ['boolean']
	},
	search_URL : {
		types : ['string', 'object'],
		required : ['url'],
		value : true
	},
	params : {
		types : ['object', 'array']
	},
	unit : {
		types : ['string']
	},
    authentication : {
        types : ['string'],
        field_required : false,
        value : true,
        valid : ['session', 'basic']
    },
    http : {
        types : ['object'],
        field_required : false,
        required : []
    }
};

function disksParam(object) {
	var isValidated = validate(object.disks, validation.disks, 'disks');
	if (isValidated == true && object.disks) {
		isValidated = validateProperties(object.disks, validation.disks);
	}
	return isValidated;
}

function dirParam(object) {
	var isValidated = validate(object.directories, validation.directories, 'directories');
	if (isValidated == true && object.directories) {
		isValidated = validateProperties(object.directories, validation.directories);
	}
	return isValidated;
}

function filesParam(object) {
	var isValidated = validate(object.files, validation.files, 'files');
	if (isValidated == true && object.files) {
		isValidated = validateProperties(object.files, validation.files);
	}
	return isValidated;
}

function httpParam(object) {
	var isValidated = validate(object.http, validation.http, 'http');
	if (isValidated == true && object.http) {
		isValidated = validateProperties(object.http, validation.http);
	}
	return isValidated;
}

function authParam(object) {
	var isValidated = validate(object.authentication, validation.authentication, 'authentication');
	if (isValidated == true && object.authentication) {
		isValidated = validateProperties(object.authentication, validation.authentication);
	}
	return isValidated;
}

function validateProperties(object, validation) {
	
	function validateProperty(object) {
		var isValidated = validateRequiredProperties(object, validation.required);
		return (isValidated == true) ?
				validateOptionalProperties(object, validation.optional) 
				: isValidated;

	}

	var isValidated = true;
	if (isArrayType(validation)) {
		for (var i=0, len = object.length; i < len ; i++) {
			isValidated = validateProperty(object[i]);
			if (isValidated != true) break;			
		}	
	} else {
		isValidated = validateProperty(object);
	}
	return isValidated;
}

function isArrayType(params) {
	return params.types.indexOf('array') > -1;
}

function validateRequiredProperties(object, properties) {
    if (properties) {
        for (var i=0, len = properties.length; i < len ; i++) {
            var property = properties[i];
            var isValiated = validate(object[property], validation[property], property, true);
            if (isValiated != true) return isValiated;
        }
    }
	return true;
}

function validateOptionalProperties(object, properties) {
    if (properties) {
        for (var i=0, len = properties.length; i < len ; i++) {
            var property = properties[i];
            if (object[property]) {
                var isValidated = validate(object[property], validation[property], property, false);
                if (isValidated != true) return isValidated;
            }
        }
    }
	return true;
}

function validate(object, params, name, required) {

	var message = '';

	function isPresent() {
		return (typeof(object) != "undefined");
	}

	function isFieldMandatory() {
	 	message = name + ' parameter is mandatory.';
		return (required || params.field_required);
	}

	function isTypeValid() {
		message = name + " parameter is of invalid type.";
		return (params.types.indexOf(typeof(object)) > -1);
	}

	function containsRequiredAttributes() {
		
		function checkArray() {
			var present = true;
			for (var i=0, len = object.length; i < len ; i++) {
				present = isRequiredPresent(object[i]);

				if (!present) break; 
			}
			return present;
		}

		function isRequiredPresent(param) {
			var present = true;
	
			if (typeof(param) == 'object' && params.required) {
				for (var i=0, len = params.required.length; i < len ; i++) {
					var item = params.required[i];
					present = (typeof(param[item]) != "undefined");

					if (!present) {
						message = name +" parameter does not contain mandatory field : "+item+".";
						break;
					}
				}

			}
			return present;
		}

		return (isArrayType(params)) ? checkArray() : isRequiredPresent(object);
	}

	function hasValue() {
		message = name + ' should have a value';
		return  (typeof(object) != 'string') || (!params.value) || 
				(typeof(object) == 'string' && params.value == true && object != '');
	}

    function hasCorrectValue() {
        message = name + ' should have correct value';
        return (typeof(object) != 'string') || (!params.valid) || (typeof(object) == 'string' && params.valid && params.valid.indexOf(object) > -1);
    }

    function isBoolean() {
		message = name + ' should be boolean';
		return  (typeof(object) != 'boolean') || 
				(typeof(object) == 'boolean' && (object != true || object != false));
	}

	return (!isFieldMandatory() && !isPresent()) ||
		   (isPresent() && isTypeValid() && containsRequiredAttributes() && hasValue() && isBoolean() && hasCorrectValue()) ||
		   (message);
}



module.exports = {
	disksParam : disksParam,
	dirParam : dirParam,
	filesParam : filesParam,
    httpParam : httpParam,
    authParam : authParam
}