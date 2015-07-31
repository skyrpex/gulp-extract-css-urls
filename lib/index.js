'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _vinyl = require('vinyl');

var _vinyl2 = _interopRequireDefault(_vinyl);

var _rework = require('rework');

var _rework2 = _interopRequireDefault(_rework);

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _tempfile = require('tempfile');

var _tempfile2 = _interopRequireDefault(_tempfile);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _crypto = require('crypto');

var _url = require('url');

var _reworkPluginUrl = require('rework-plugin-url');

var _reworkPluginUrl2 = _interopRequireDefault(_reworkPluginUrl);

var _vinylSourcemapsApply = require('vinyl-sourcemaps-apply');

var _vinylSourcemapsApply2 = _interopRequireDefault(_vinylSourcemapsApply);

var md5 = function md5(buffer) {
  return (0, _crypto.createHash)('md5').update(buffer.toString()).digest('hex');
};

var compile = function compile() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _through22['default'].obj(function (file, enc, callback) {
    var _this = this;

    var handle = function handle(url) {
      var obj = (0, _url.parse)(url);
      var filename = obj.pathname;
      var contents = _fs2['default'].readFileSync(filename);

      var extname = _path2['default'].extname(filename);
      var basename = _path2['default'].basename(filename, extname);
      obj.pathname = basename + '.' + md5(contents) + extname;

      _this.push(new _vinyl2['default']({
        path: obj.pathname,
        contents: contents
      }));

      return (0, _url.format)(obj);
    };

    var result = (0, _rework2['default'])(file.contents.toString()).use((0, _reworkPluginUrl2['default'])(handle)).toString({ sourcemap: true, sourcemapAsObject: true });

    file.contents = new Buffer(result.code);

    // TODO Apply sourcemaps... It doesn't work for now.
    // if (file.sourceMap) {
    //   applySourceMap(file, result.map.toString());
    // }

    this.push(file);
    callback();
  });
};

exports['default'] = compile;
module.exports = exports['default'];