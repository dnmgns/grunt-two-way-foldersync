/// <vs AfterBuild='default' SolutionOpened='default' />
module.exports = function (grunt) {
    /*
    * Function for recursively merging properties of the two configuration objects
    */
    function mergeConfigs(settings, customsettings) {
        for (var p in customsettings) {
            if (customsettings.hasOwnProperty(p)) {
                try {
                    if (customsettings[p].constructor === Array) {
                        settings[p] = settings[p].concat(customsettings[p]); // Concatenate arrays
                    } else {
                        settings[p] = customsettings[p]; // If not array, custom settings overwrite default settings
                    }
                } catch (e) {
                    settings[p] = customsettings[p]; // On exception, custom settings overwrite default settings
                }
            }
        }

        return settings;
    }

    /*
     * Config Properties
     * Merge config properties if we have any custom configuration
     */
    var defaultSettingsFile = "foldersyncsettings.json";
    var userSettingsFile = "foldersyncsettings.user";

    var settings = grunt.file.readJSON(defaultSettingsFile);

    if (grunt.file.exists(userSettingsFile)) {
        var customSettings = grunt.file.readJSON(userSettingsFile);
        settings = mergeConfigs(settings, customSettings);
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        settings: settings,

        copy: {
            toA: {
                files: [{
                    expand: true,
                    cwd: settings.gitPackagesPath,
                    src: settings.files,
                    dest: settings.APackagesPath
                }],
                verbose: true,
                options: {
                    timestamp: true
                }
            },
            toB: {
                files: [{
                    expand: true,
                    cwd: settings.APackagesPath,
                    src: settings.files,
                    dest: settings.gitPackagesPath
                }],
                verbose: true,
                options: {
                    timestamp: true
                }
            }
        },

        watch: {
            B: {
                files: settings.files,
                tasks: ["newer:copy:toA"],
                options: {
                    cwd: settings.gitPackagesPath,
                    event: ["added", "changed"],
                    /*interval: 10000*/
                }
            },
            A: {
                files: settings.files,
                tasks: ["newer:copy:toB"],
                options: {
                    cwd: settings.APackagesPath,
                    event: ["added", "changed"],
                    /*interval: 1000*/
                }
            }
        }
    });

    /*
    * Load Npm and register default start task
    */
    grunt.loadNpmTasks("grunt-contrib-watch"); // Watch files/folders
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-newer");

    grunt.registerTask("default", ["watch"]);
};
