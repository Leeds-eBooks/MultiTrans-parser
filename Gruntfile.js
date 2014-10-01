module.exports = function(grunt) {
  grunt.initConfig({
    "parse-phrases": {
      options: {
        phrase_delimiter: '|',
        option_delimiter: '`'
      },
      target1: {
        src: 'abc.txt'
      }
    }
  });
  grunt.registerMultiTask('parse-phrases', function() {
    var options=this.options({
          phrase_delimiter: '|',
          option_delimiter: '`'
        }),
        phraseDelimiter=options.phrase_delimiter,
        optionDelimiter=options.option_delimiter,
        srcFilePath=this.files[0].src,
        fileString=grunt.file.read(srcFilePath).trim(),
        cleanFileString=fileString.lastIndexOf(phraseDelimiter,0)===0 ? // TODO: needs to handle newlines too
          fileString.slice(1) : fileString,
        phraseArray=cleanFileString.split(phraseDelimiter);
    grunt.log.writeln(phraseArray);
    grunt.log.writeln('Array has '+phraseArray.length+' elements.');
    // TODO
  });
  grunt.registerTask('default', ['parse-phrases']);
};