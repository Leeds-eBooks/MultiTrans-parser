import parser from './parser'

console.log(JSON.stringify(parser(process.argv[2]).content))
