var fileExtensions = {
    Image : ['jpg', 'png', 'gif', 'jpeg', 'tiff', 'bmp'],
    Excel : ['xls', 'xlsx'],
    Text : ['txt'],
    PDF : ['pdf'],
    Word : ['doc', 'docx'],
    Javascript : ['js'],
    Css : ['css'],
    JSON : ['json'],
    xml : ['xml']
};
var fontClassesForFileType = {
    Image : 'fa-file-image-o',
    Excel : 'fa-file-excel-o',
    Text : 'fa-file-text-o',
    PDF : 'fa-file-pdf-o',
    Word : 'fa-file-word-o',
    Javascript : 'fa-file-code-o',
    Css : 'fa-file-code-o',
    JSON : 'fa-file-code-o',
    xml : 'fa-file-code-o'
};

function slugify(name) {
    return name.toLowerCase().replace(new RegExp(' ', 'g'), '_')
        .replace(new RegExp('/', 'g'), '_')
        .replace('.', '_')
        ;
}

function unSlugify(name) {
    return capitalizeFirstLetter(name.replace(new RegExp('_', 'g'), ' '));
}

function isImage(type) {
    return (type == 'Image');
}

function getFontAwesomeClass(type) {
    var css = fontClassesForFileType[type];
    css = css || 'fa-file-o';
    return css;
}

function compareAsc(a, b, prop) {
    if (typeof(a[prop]) == 'number') {
        return compareAscNumbers(a, b, prop);
    } else {
        if (a[prop] < b[prop])
            return -1;
        else if (a[prop] > b[prop])
            return 1;
        else
            return 0;

    }
}

function compareAscNumbers(a, b, prop) {
    return a[prop] - b[prop];
}

function compareDesc(a, b, prop) {
    if (typeof(a[prop]) == 'number') {
        return compareDescNumbers(a, b, prop);
    } else {
        if (a[prop] > b[prop])
            return -1;
        else if (a[prop] < b[prop])
            return 1;
        else
            return 0;
    }
}

function compareDescNumbers(a, b, prop) {
    return b[prop] - a[prop];
}

function sortByType(object, type, order) {
    return object.sort(function (a, b) {
        if (order) {
            return compareAsc(a, b, type);
        } else {
            return compareDesc(a, b, type);
        }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getCookie(cookieName) {
    var cookies = document.cookie;
    var cookieArray = cookies.split(';');

    for (var i = 0, len = cookieArray.length; i < len; i++) {
        var cookie = cookieArray[i];
        var keyValue = cookie.split('=');
        if (keyValue.length > 0 && keyValue[0] == cookieName) {
            return keyValue[1];
        }
    }
}

function getFileType(filename) {

    var extension = filename.split('.').pop();

    for (var type in fileExtensions) {
        if (fileExtensions[type].indexOf(extension) > - 1) {
            return type;
        }
    }
}

module.exports = {
    slugify: slugify,
    unSlugify: unSlugify,
    isImage: isImage,
    getFontAwesomeClass: getFontAwesomeClass,
    sortByType: sortByType,
    getCookie: getCookie,
    getFileType: getFileType
};