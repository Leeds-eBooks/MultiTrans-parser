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
        cleanString=function(str) {
          var s=str.trim();
          function startsWith(S,ch) {
            return S.lastIndexOf(ch,0)===0 ? S.slice(1) : S;
          }
          function endsWith(S,ch) {
            return S.substr(-1)===ch ? S.slice(0,-1) : S;
          }
          s=startsWith(s,phraseDelimiter);
          s=endsWith(s,phraseDelimiter);
          s=startsWith(s,"\r\n");
          s=endsWith(s,"\r\n");
          return s.trim();
        },
        cleaned=cleanString(fileString),
        lineArray=cleaned.split(/\r\n/g);
    lineArray=lineArray.map(cleanString).map(function(v,i,a) {
      return v.split(phraseDelimiter).map(cleanString);
    }).map(function(v,i,a) {
      return v.map(function(v,i,a) {
        return v.split(optionDelimiter).map(cleanString)
      });
    });
    grunt.log.writeln(JSON.stringify(lineArray));
  });
  grunt.registerTask('default', ['parse-phrases']);
};