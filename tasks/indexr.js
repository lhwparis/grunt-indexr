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

  grunt.registerMultiTask('indexr', 'generates a index.html overview for static templates', function () {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
		template: false,
		meta_data_separator: /\r?\n\r?\n/,
		replaceInFilePath: ""
    });
	
	var parse = parseSetup(options.meta_data_separator);

	var stripNumbers = function (sString) {
		if (sString.length > 3) {
			return sString.substring(0,3).replace(/[0-9]/g, '') + sString.substring(3);
		}
		return sString;
	};

    var templateList = [];
	var keyMap = {};
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
		
			var filepathSplit = filepath.split('/');
			filepathSplit = _.last(filepathSplit).split('.');
			if(filepathSplit.length !== 3) {
				filepathSplit.unshift("_");
			}
			if(typeof keyMap[filepathSplit[0]] === 'undefined') {
				keyMap[filepathSplit[0]] = templateList.length;
				templateList[keyMap[filepathSplit[0]]] = { name: stripNumbers(filepathSplit[0]), namespaceDescription: (typeof header.namespaceDescription === 'undefined') ? "" : stripNumbers(header.namespaceDescription),  items: []};
			}
			templateList[keyMap[filepathSplit[0]]].items.push({fileName: filepath.replace(options.replaceInFilePath, ''), readName: stripNumbers(filepathSplit[1]), header: header});
			return true;
        }
      });

    });
	var templateSettings = {
		strip: false
	};
	var settings = _.extend({}, dot.templateSettings, templateSettings);
	var src = grunt.file.read(options.template);
	var template = dot.template(src, settings);
	var output = template(_.extend({}, {indexr: templateList}));

	grunt.file.write('.tmp/index.html', output);
  });

};