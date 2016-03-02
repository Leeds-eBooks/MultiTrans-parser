import parser from './parser'
import chalk from 'chalk'
import CSON from 'cson'
import clip from 'to-clipboard'

const {content, title, path} = parser(process.argv[2]),
      cson = CSON.stringify(content, null, 2);

console.log(chalk.green('Path:'), path)
console.log(chalk.green('Title:'), title)
console.log('')
console.log(chalk.green('Content:'))
console.log(cson)

try {
  clip.sync(cson)
  console.log('')
  console.log(chalk.green('✔︎ Copied to clipboard'))
  console.log('')
} catch (e) {
  console.log('')
  console.error(chalk.red('Copying to clipboard FAILED', e))
  console.log('')
}
