import 'babel/register'
import os from 'os'
import _ from 'underscore'
import parseG from 'parse'; const Parse = parseG.Parse
import * as keys from './keys'
import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'
// import Xtrash from 'trash'; const trash = Promise.promisify(Xtrash)
import Xglob from 'glob'; const glob  = Promise.promisify(Xglob)

// trash(['./dist'])
// .catch(err => err.message.includes('t exist') ? Promise.resolve() : Promise.reject(err))
// .then(() => {

Parse.initialize(keys.appId, keys.jsKey)

const Text = Parse.Object.extend('Text'),

  phraseDelimiter = '|',
  optionDelimiter = '`',

  cleanString = str => {
    let s = str.trim()

    const startsWith = (S, ch) => S.lastIndexOf(ch, 0) === 0 ? S.slice(1) : S
    const endsWith = (S, ch) => S.substr(-1) === ch ? S.slice(0, -1) : S

    s = startsWith(s, phraseDelimiter)
    s = endsWith(s, phraseDelimiter)
    s = startsWith(s, os.EOL)
    s = endsWith(s, os.EOL)
    return s.trim()
  },

  parse = p => {
    const fileString = fs.readFileSync(p, {encoding: 'utf8'}).trim(),
          [extract, title] = /#([\s\S]+?$)/m.exec(fileString),
          cleaned = cleanString(fileString.replace(extract, '')),
          lineArray = cleaned
            .split(os.EOL)
            .map(cleanString)
            .map(v => v.split(phraseDelimiter).map(cleanString))
            .map(v => ~p.indexOf('.trans.') ?
              v.map(v => v.split(optionDelimiter).map(cleanString)) : v
            )

    const content = JSON.stringify(lineArray, null, 2)
    return {content, title: title.trim(), path: path.basename(p, '.txt')}
  }

const q = new Parse.Query(Text)

q.find()
.then(res => res.map(item => ({
  title: item.get('titleOrig'),
  trans: item.get('titleTrans'),
  obj: item
})))
.then(parseTexts => {
  glob('./src/*').then(files => {
    files.map(parse)
    .map(({content, title, path}) => {
      const titles = _.pluck(parseTexts, 'title'),
            transTitles = _.pluck(parseTexts, 'trans'),
            type = path.split('.')[1]

      console.log(type);

      if (titles.includes(title)) {
        // text already exists, we're updating
        // console.log(true)
      } else {
        // new text
        // console.log(false)
      }
    })
  })
})
.fail(err => console.log(err))

// })
