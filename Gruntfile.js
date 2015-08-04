module.exports = function(grunt) {

/*
* Function for recursively merging properties of the two configuration objects
*/
function MergeConfigs(settings, customsettings) {
    for (var p in customsettings) {
        try {
          if (customsettings[p].constructor==Array) {
            settings[p] = settings[p].concat(customsettings[p]); // Concatenate arrays
          } else {
            settings[p] = customsettings[p]; // If not array, custom settings overwrite default settings
          }
        } catch(e) {
          settings[p] = customsettings[p]; // On exception, custom settings overwrite default settings
        }
      }
      
    return settings;
}

/*
* Config Properties
* Merge config properties if we have any custom configuration
*/
defaultSettingsFile = 'foldersyncsettings.json'
customSettingsFile = 'custom_foldersyncsettings.json'

settings = grunt.file.readJSON(defaultSettingsFile);

if (grunt.file.exists(customSettingsFile)) {
    customSettings = grunt.file.readJSON(customSettingsFile);
    settings = MergeConfigs(settings, customSettings)
}

/*
* Initialize a configuration object for the current project.
*/
grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    settings: settings,

    sync: {
        a: {
            expand: true, // Returns a unique array of all file or directory paths that match the given globbing pattern(s)
            cwd: '<%= settings.syncPathB %>', // Patterns will be matched relative to this path, and all returned filepaths will also be relative to this path.
            src: '<%= settings.files %>', // Source
            dest: '<%= settings.syncPathA %>', // Destination
            //pretend: true, // Don't do any IO.
            verbose: false, // Display log messages when copying files
            //failOnError: true, // Fail the task when copying is not possible. Default: false
            //ignoreInDest: "**/*.js", // Never remove js files from destination. Default: none
            //updateAndDelete: true // Remove all files from dest that are not found in src. Default: false
        },
        b: {
            expand: true,
            cwd: '<%= settings.syncPathA %>',
            src: '<%= settings.files %>',
            dest: '<%= settings.syncPathB %>'
        },
    },

    watch: {
        a: {
            cwd: '<%- settings.pathA %>',
            files: '<%= settings.files %>',
            tasks: ['sync:a'],
            options: {
                event: ['added', 'changed'],
            }
        },
        b: {
            cwd: '<%- settings.pathB %>',
            files: '<%= settings.files %>',
            tasks: ['sync:b'],
            options: {
                event: ['added', 'changed'],
            }
        },
        gruntfile: {
            files: 'Gruntfile.js',
            tasks: ['default']
        },
    }
});

/*
* Load Npm and register default start task
*/
grunt.loadNpmTasks('grunt-contrib-watch'); // Watch files/folders
grunt.loadNpmTasks('grunt-sync'); // Compares modification times for src/dest and only copies files with newer modification time. 

grunt.registerTask('default', ['watch']);
};