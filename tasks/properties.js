/*
 * grunt-properties
 * https://github.com/helder/grunt-properties
 *
 * Copyright (c) 2013 Helder Santana
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var pParser = require('properties-parser');

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('properties', 'Convert java .properties files to javascript', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
          namespace: 'config'
        }),
        useNS = options.namespace.length > 0,
        src = useNS === false ? '{\n' :
            'var ' + options.namespace + ' = ' + options.namespace + ' || {};\n';

    function convert(filepath) {
      var fileContent = grunt.file.read(filepath),
          ns = options.namespace,
          exp = null,
          code = [];

      fileContent = pParser.parse(fileContent);

      for (var file in fileContent) {
        exp =
            (useNS ? ns + '[' : '  ') + '"' + file + '"' +
            (useNS ? ']' : '') + (useNS ? ' = ' : ': ') + '"' +
            fileContent[file].replace(/"/g, '\\"') + '"' + (useNS ? ';' : ',');

        code.push(exp);
      }

      return code.join('\n');
    }

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {

      // Concat specified files.
      src += f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('.properties file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(convert).join('\n');

      if (useNS !== true) {
        src = src.substring(0, src.length - 1) + '\n};';
      }

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
