import 'babel/polyfill'
import os from 'os'

export default function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean')

  grunt.initConfig({
    clean: {
      dist: ["dist/"]
    },
    "parse-phrases": {
      options: {
        phrase_delimiter: '|',
        option_delimiter: '`'
      },
      target1: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['*.orig.txt'],
          dest: 'dist/',
          ext: '.orig.js'
        }]
      },
      target2: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['*.trans.txt'],
          dest: 'dist/',
          ext: '.trans.js'
        }]
      }
    }
  })

  grunt.registerMultiTask('parse-phrases', function() {
    const options = this.options({
            phrase_delimiter: '|',
            option_delimiter: '`'
          }),

          phraseDelimiter = options.phrase_delimiter,
          optionDelimiter = options.option_delimiter,

          cleanString = function(str) {
            let s = str.trim()

            const startsWith = (S, ch) => S.lastIndexOf(ch, 0) === 0 ? S.slice(1) : S
            const endsWith = (S, ch) => S.substr(-1) === ch ? S.slice(0, -1) : S

            s = startsWith(s, phraseDelimiter)
            s = endsWith(s, phraseDelimiter)
            s = startsWith(s, os.EOL)
            s = endsWith(s, os.EOL)
            return s.trim()
          };

    function theTask(file) {
      const f = file,
            srcFilePath = f.src[0],
            fileString = grunt.file.read(srcFilePath).trim(),
            cleaned = cleanString(fileString),
            lineArray = cleaned
              .split(os.EOL)
              .map(cleanString)
              .map(v => v.split(phraseDelimiter).map(cleanString))
              .map(v => ~srcFilePath.indexOf('.trans.') ?
                v.map(v => v.split(optionDelimiter).map(cleanString)) : v
              )

      const output = JSON.stringify(lineArray, null, 2)
      grunt.log.writeln(srcFilePath)
      grunt.file.write(f.dest, output)
    }

    this.files.forEach(theTask)
  })

  grunt.registerTask('default', ['clean:dist', 'parse-phrases']);

}