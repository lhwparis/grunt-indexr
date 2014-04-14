/*
 * grunt-indexr
 * 
 *
 * Copyright (c) 2014 Timo Mayer
 * Licensed under the MIT license.
 */

'use strict';

var dot = require("dot");
var _ = require("underscore");
var parseSetup = require("../lib/parse");

module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('indexr', 'generates a index.html file with all your templates ', function () {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      template: false,
	  meta_data_separator: /\r?\n\r?\n/
    });
	
	var parse = parseSetup(options.meta_data_separator);

    var templateList = [];
    // Iterate over all specified file groups.
    this.files.forEach(function (file) {
      // Concat specified files.
        file.src.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).

          if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
		  var readHeader = _.compose(parse.header, grunt.file.read);
		  var header  = readHeader(filepath);
		  templateList.push({fileName:filepath, readName: filepath, header: header});
          return true;
        }
      });

    });
      var templateSettings = {};
      //var settings = _.extend({}, dot.templateSettings, template_settings);
      var src = grunt.file.read(options.template);
      var template = dot.template(src);
      var output = template(_.extend({}, {testx: templateList}));

      grunt.file.write('tmp/index.html', output);
  });

};
