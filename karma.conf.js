module.exports = function(config) {
    config.set({
        frameworks: ['browserify','jasmine'],
        reporters: ['dots'],
        browsers: ['Chrome'],
        files: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'dist/js/disk-browser.js',
            'tests/**/*Spec.js'
        ],
        preprocessors: {
            'tests/**/*Spec.js': [ 'browserify' ]
        },
        browserify: {
            debug: true,
            transform: [ 'brfs' ]
        },
        // plugins to load
        plugins: [
          'karma-jasmine',
          'karma-browserify',
          'karma-chrome-launcher'
        ]
    });
};