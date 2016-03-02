import path from 'path'
import fs from 'fs'
import os from 'os'

const phraseDelimiter = '|',
      optionDelimiter = '~';

function cleanString(str) {
  let s = str.trim()

  const startsWith = (S, ch) => S.lastIndexOf(ch, 0) === 0 ? S.slice(1) : S
  const endsWith = (S, ch) => S.substr(-1) === ch ? S.slice(0, -1) : S

  s = startsWith(s, phraseDelimiter)
  s = endsWith(s, phraseDelimiter)
  s = startsWith(s, os.EOL)
  s = endsWith(s, os.EOL)
  return s.trim()
}

export default function(p) {
  const fileString = fs.readFileSync(p, {encoding: 'utf8'}).trim(),
        [extract, title] = /#([\s\S]+?$)/m.exec(fileString),
        cleaned = cleanString(fileString.replace(extract, '')),
        lineArray = cleaned
          .split(os.EOL)
          .map(cleanString)
          .map(v => v.split(phraseDelimiter).map(cleanString))
          .map(v => p.includes('.trans.') ?
            v.map(v => v.split(optionDelimiter).map(cleanString)) : v
          )

  return {
    content: lineArray,
    title: title.trim(),
    path: path.basename(p, '.txt')
  }
}
