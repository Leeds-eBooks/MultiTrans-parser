'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('babel/register');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _parse = require('parse');

var _parse2 = _interopRequireDefault(_parse);

var _keys = require('./keys');

var keys = _interopRequireWildcard(_keys);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

// import Xtrash from 'trash'; const trash = Promise.promisify(Xtrash)

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var Parse = _parse2['default'].Parse;
var glob = _bluebird2['default'].promisify(_glob2['default']);

// trash(['./dist'])
// .catch(err => err.message.includes('t exist') ? Promise.resolve() : Promise.reject(err))
// .then(() => {

Parse.initialize(keys.appId, keys.jsKey);

var Text = Parse.Object.extend('Text'),
    phraseDelimiter = '|',
    optionDelimiter = '`',
    cleanString = function cleanString(str) {
  var s = str.trim();

  var startsWith = function startsWith(S, ch) {
    return S.lastIndexOf(ch, 0) === 0 ? S.slice(1) : S;
  };
  var endsWith = function endsWith(S, ch) {
    return S.substr(-1) === ch ? S.slice(0, -1) : S;
  };

  s = startsWith(s, phraseDelimiter);
  s = endsWith(s, phraseDelimiter);
  s = startsWith(s, _os2['default'].EOL);
  s = endsWith(s, _os2['default'].EOL);
  return s.trim();
},
    parse = function parse(p) {
  var fileString = _fs2['default'].readFileSync(p, { encoding: 'utf8' }).trim();

  var _sS$M$exec = /#([\s\S]+?$)/m.exec(fileString);

  var _sS$M$exec2 = _slicedToArray(_sS$M$exec, 2);

  var extract = _sS$M$exec2[0];
  var title = _sS$M$exec2[1];
  var cleaned = cleanString(fileString.replace(extract, ''));
  var lineArray = cleaned.split(_os2['default'].EOL).map(cleanString).map(function (v) {
    return v.split(phraseDelimiter).map(cleanString);
  }).map(function (v) {
    return ~p.indexOf('.trans.') ? v.map(function (v) {
      return v.split(optionDelimiter).map(cleanString);
    }) : v;
  });

  var content = JSON.stringify(lineArray, null, 2);
  return { content: content, title: title.trim(), path: _path2['default'].basename(p, '.txt') };
};

var q = new Parse.Query(Text);

q.find().then(function (res) {
  return res.map(function (item) {
    return {
      title: item.get('titleOrig'),
      trans: item.get('titleTrans'),
      obj: item
    };
  });
}).then(function (parseTexts) {
  glob('./src/*').then(function (files) {
    files.map(parse).map(function (_ref) {
      var content = _ref.content;
      var title = _ref.title;
      var path = _ref.path;

      var titles = _underscore2['default'].pluck(parseTexts, 'title'),
          transTitles = _underscore2['default'].pluck(parseTexts, 'trans'),
          type = path.split('.')[1];

      console.log(type);

      if (titles.includes(title)) {
        // text already exists, we're updating
        // console.log(true)
      } else {
          // new text
          // console.log(false)
        }
    });
  });
}).fail(function (err) {
  return console.log(err);
});

// })
