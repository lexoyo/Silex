/*

Inspired by https://gist.github.com/madr/7356170

Uses:

* check syntax with *lint, compile with google closure builder/compiler

  $ grunt deploy

* watch and build the debug version when file changes, also use livereload

  $ grunt watch

* check syntax with *lint, compile with google closure builder/compiler, execute functional tests

  $ grunt test -phantomjs
  $ grunt test -firefox
  $ grunt test -chrome
  $ grunt doWatch:test -phantomjs

* fix style with google fix style (indentation etc)

  $ grunt fix

* check syntax with *lint

  $ grunt check

*/
module.exports = function(grunt) {

  var production = false;
  if (!grunt.file.exists('node_modules/grunt-contrib-watch')) {
    production = true;
  }

  // when debug mode, allows debug tastks like source maps, test tools...
  if (!production){
    grunt.loadNpmTasks('grunt-selenium-webdriver');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-append-sourcemapping');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-closure-linter');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.task.renameTask('watch', 'doWatch')
  }

  // build tasks
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jade');

  // deploy tasks
  grunt.registerTask('heroku', ['releaseDeploy']);
  grunt.registerTask('deploy', ['releaseDeploy']);
  grunt.registerTask('releaseDeploy', ['concat', 'less:production', 'jade:release', 'closureBuilder:release', 'cloudExplorerBuild']);
  grunt.registerTask('debugDeploy', ['concat', 'less:development', 'jade:debug', 'closureBuilder:debug', 'append-sourcemapping', 'cloudExplorerBuild']);

  // test and check tasks
  grunt.registerTask('check', ['htmllint', 'csslint:lax', 'closureLint']);
  grunt.registerTask('test', ['releaseDeploy', 'selenium_start', 'simplemocha', 'selenium_stop']);
  grunt.registerTask('fix', ['closureFixStyle']);

  grunt.registerTask('default', ['deploy']);

  // watch for file modifications and then build Silex and restart Silex server
  grunt.registerTask('watch', 'Start Silex', function () {
    console.log('watch for file modifications and then build Silex and restart Silex server');
    grunt.task.run([
      'runDebug',
      'doWatch:main'
    ]);
  });
  // run build Cloud Explorer
  grunt.registerTask('cloudExplorerBuild', 'Run haxe and build Cloud Explorer', function (done) {
    // var buildCommand = 'node node_modules/haxe/bin/haxe-cli.js -js submodules/cloud-explorer/app/scripts/cloud-explorer.js -cp submodules/cloud-explorer/src ce.api.CloudExplorer';
    var buildCommand = 'cd submodules/cloud-explorer/; npm install; node_modules/grunt-cli/bin/grunt npmHaxeBuild';
    console.log('Run build Cloud Explorer');
    console.log('Run build Cloud Explorer - Executing', buildCommand);
    var sh = require('execSync');
    var code = sh.run(buildCommand);
    console.log('Run build Cloud Explorer - return code ' + code);
    if (code !== 0){
      console.log('ERROR: Cloud Explorer build failed with code', code);
      //throw new Error('Cloud Explorer build failed');
    }
  });
  // Start Silex server
  grunt.registerTask('run', 'Start Silex', function () {
    console.log('Start Silex server');
    var server = require('./dist/server/server.js');
  });
  // Start Silex server in debug mode
  grunt.registerTask('runDebug', 'Start Silex', function () {
    var server = require('./dist/server/server.js');
    server.setDebugMode(true);
    console.log('Start Silex server in debug mode', server);
  });
  // Install Silex git hooks
  grunt.registerTask('install', function() {
    console.log('Install Silex git hooks');
    try{
      var fs = require('fs');
      grunt.file.copy('build/pre-commit', '.git/hooks/pre-commit');
      fs.chmodSync('.git/hooks/pre-commit', '755');
      console.log('.git/hooks/pre-commit file written');
    }
    catch(e){
      console.log('not able to add precommit hook.');
    }
  });
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
    , csslint: {
      lax: {
        src: ['src/css/*.css']
        , options: {
          important: false // useful when opening a website in Silex
            , "adjoining-classes" : false
            , "known-properties" : false
            , "box-sizing" : false
            , "box-model" : false
            , "overqualified-elements" : false
            , "fallback-colors" : false
            , "unqualified-attributes" : false
        }
      }
    }
    , concat: {
      dist: {
        src: ['src/css/*.less']
        , dest: 'src/css/.temp'
      }
    }
    , htmllint: {
        all: ["dist/client/*.html"]
    }
    , closureLint: {
      app:{
        closureLinterPath : 'submodules/closure-linter/closure_linter'
        , command: 'gjslint.py'
        , src: [ 'src/js/**/*.js' ]
        , options: {
          stdout: true
          , strict: true
        }
      }
    }
    , closureFixStyle: {
      app:{
        closureLinterPath : 'submodules/closure-linter/closure_linter'
        , command: 'fixjsstyle.py'
        , src: [ 'src/js/**/*.js' ]
        , options: {
          strict: true
          , stdout: true
        }
      }
    }
    , less: {
      development: {
        options: {
          cleancss: true
        }
        , files: {
          "dist/client/css/admin.css": "src/css/.temp"
        }
      }
      , production: {
        files: {
          "dist/client/css/admin.min.css": "src/css/.temp"
        }
      }
    }
    , jade: {
      release: {
        options: {
          data: {
            debug: false
          }
        }
        , files: {
          "dist/client/index.html": ["src/html/release.jade"]
        }
      }
      , debug: {
        options: {
          data: {
            debug: true
          }
        }
        , files: {
          "dist/client/debug.html": ["src/html/debug.jade"]
        }
      }
    }
    , closureBuilder: {
      release: {
        options: {
          closureLibraryPath: 'submodules/closure-library'
          , namespaces: ['silex.App']
          , builder: 'submodules/closure-library/closure/bin/build/closurebuilder.py'
          , compilerFile: 'build/closure-compiler.jar'
          , compile: true
          , compilerOpts: {
            compilation_level: 'SIMPLE_OPTIMIZATIONS'
            , debug: false
            , create_source_map: 'dist/client/js/admin.min.js.map'
            , source_map_format: 'V3'
          }
        }
        , src: ['src/js/', 'submodules/closure-library/']
        , dest: 'dist/client/js/admin.min.js'
      }
      , debug: {
        options: {
          closureLibraryPath: 'submodules/closure-library'
          , namespaces: 'silex.App'
          , builder: 'submodules/closure-library/closure/bin/build/closurebuilder.py'
          , compilerFile: 'build/closure-compiler.jar'
          , compile: true // disable to speedup the compilation but also disable source map
          , compilerOpts: {
            compilation_level: 'SIMPLE_OPTIMIZATIONS'
            , formatting: 'PRETTY_PRINT'
            , debug: true
            , create_source_map: 'dist/client/js/admin.js.map'
            , source_map_format: 'V3'
          }
        }
        , src: ['submodules/closure-library/', 'src/js/']
        , dest: 'dist/client/js/admin.js'
      }
    }
    , "append-sourcemapping": {
        main: {
            files: {
                "dist/client/js/admin.js": "admin.js.map"
            }
        }
    }
    , doWatch: {
        options: {
          livereload: true
          , atBegin: true
        }
        , main: {
            files: ['src/js/**/*.js', 'dist/server/**/*.js', 'src/css/*.css', 'src/css/*.less', 'src/html/**/*.jade', 'dist/client/**/*.html', 'Gruntfile.js']
            , tasks: ['debugDeploy', 'run']
        }
        , test: {
            files: ['test/**/*.js', 'src/js/**/*.js', 'dist/server/**/*.js', 'src/css/*.css', 'src/css/*.less', 'src/html/**/*.jade', 'dist/client/**/*.html', 'Gruntfile.js']
            , tasks: ['simplemocha']
        }
    }
    , simplemocha: {
        options: {
          globals: ['should']
          , ignoreLeaks: false
          , ui: 'bdd'
          , reporter: 'nyan'
        }
        , all: { src: 'test/**/*.js' }
//        , all: { src: 'test/**/file-explorer.js' }
      }
  });
}
