module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    pizza: {
      js: ['js/pizza.js', 'js/pizza/*.js'],
      scss: ['scss/pizza.scss']
    },

    sass: {
      dist_compressed: {
        options: {
          includePaths: ['scss']
        },
        files: {
          'dist/css/pizza.css': '<%= pizza.scss %>',
          'dist/css/vendor/normalize.css': 'bower_components/foundation/css/normalize.css',
          'dist/css/vendor/foundation.css': 'bower_components/foundation/css/foundation.css'
        }
      }
    },

    concat: {
      dist: {
        files: {
          'dist/js/pizza.js': '<%= pizza.js %>'
        }
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      dist: {
        files: {
          'dist/js/pizza.min.js': ['<%= pizza.js %>'],
          'dist/js/vendor/dependencies.js': ['bower_components/jquery/jquery.js', 'bower_components/Snap.svg/dist/snap.svg.js', 'bower_components/foundation/js/foundation.js'],
          'dist/js/vendor/modernizr.js': ['bower_components/modernizr/modernizr.js']
        }
      }
    },

    clean: ['dist/'],

    watch: {
      grunt: { files: ['Gruntfile.js'] },
      sass: {
        files: ['scss/**/*.scss'],
        tasks: ['sass']
      },
      js: {
        files: ['js/**/*.js'],
        tasks: ['concat', 'uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-newer');

  grunt.task.registerTask('watch_start', ['watch']);
  grunt.registerTask('build:assets', ['clean', 'sass', 'concat', 'uglify']);
  grunt.registerTask('build', ['build:assets']);
  grunt.registerTask('default', ['build', 'watch']);
};
