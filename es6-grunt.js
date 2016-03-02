import 'babel/register'
import os from 'os'
import _ from 'underscore'
import parseG from 'parse'; const Parse = parseG.Parse
import * as keys from './keys'
import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'
import c from 'chalk'
import Xglob from 'glob'; const glob = Promise.promisify(Xglob)

Parse.initialize(keys.appId, keys.jsKey)

const success = _.compose(console.log.bind(console), c.green)
const error   = _.compose(console.log.bind(console), c.red)

const Text = Parse.Object.extend('Text'),

  phraseDelimiter = '|',
  optionDelimiter = '~',

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

    return {
      content: lineArray,
      title: title.trim(),
      path: path.basename(p, '.txt')
    }
  }

const q = new Parse.Query(Text)
const newTexts = new Map()

q.find()
.then(res => res.map(item => ({
  title: item.get('titleOrig'),
  trans: item.get('titleTrans'),
  obj: item
})))
.then(parseTexts =>
  glob('./src/*').then(files =>
    files.map(parse)
    .map(({content, title, path}) => {
      const titles =      _.pluck(parseTexts, 'title'),
            transTitles = _.pluck(parseTexts, 'trans'),
            objs =        _.pluck(parseTexts, 'obj'),

            [identifier, type] = path.split('.');

      console.log('type = ', type)
      console.log('title = ', title)

      let i
      if ((i = titles.indexOf(title)) > -1) {
        // orig already exists, we're updating
        const obj = objs[i]
        obj.save({orig: content})
        .then(() => success(`SAVE successful: ${title}`))
        .fail(error)

      } else if ((i = transTitles.indexOf(title)) > -1) {
        // trans already exists, we're updating
        const obj = objs[i]
        obj.save({trans: content})
        .then(() => success(`SAVE successful: ${title}`))
        .fail(error)

      } else {
        // new text

        if (newTexts.has(identifier)) {
          // already started to build this text
          const text = newTexts.get(identifier)

          if (type === 'orig') {
            text.save({
              orig: content,
              titleOrig: title
            }).then(() => success(`SAVE successful: ${title}`))
            .fail(error)
          } else {
            text.save({
              trans: content,
              titleTrans: title
            }).then(() => success(`SAVE successful: ${title}`))
            .fail(error)
          }

        } else {
          // brand new text that we haven't yet started to build
          const text = new Text()
          if (type === 'orig') {
            text.set('orig', content)
            text.set('titleOrig', title)
          } else {
            text.set('trans', content)
            text.set('titleTrans', title)
          }
          newTexts.set(identifier, text)
          console.log(newTexts.size)
        }
      }

      console.log(' ');
    })
  )
).fail(err => console.log(err))
