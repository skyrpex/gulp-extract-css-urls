'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _vinyl = require('vinyl');

var _vinyl2 = _interopRequireDefault(_vinyl);

var _rework = require('rework');

var _rework2 = _interopRequireDefault(_rework);

var _crypto = require('crypto');

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _lodashTemplate = require('lodash.template');

var _lodashTemplate2 = _interopRequireDefault(_lodashTemplate);

var _reworkPluginUrl = require('rework-plugin-url');

var _reworkPluginUrl2 = _interopRequireDefault(_reworkPluginUrl);

var _convertSourceMap = require('convert-source-map');

var _convertSourceMap2 = _interopRequireDefault(_convertSourceMap);

var _vinylSourcemapsApply = require('vinyl-sourcemaps-apply');

var _vinylSourcemapsApply2 = _interopRequireDefault(_vinylSourcemapsApply);

var md5 = function md5(buffer) {
  return (0, _crypto.createHash)('md5').update(buffer.toString()).digest('hex');
};

// [name].[hash][ext]

var compile = function compile() {
  var name = arguments.length <= 0 || arguments[0] === undefined ? '[hash][ext]' : arguments[0];

  return _through22['default'].obj(function (file, enc, callback) {
    var _this = this;

    try {
      var handle = function handle(url) {
        // Ignore data URLs.
        if (url.match(/^data:/)) {
          return url;
        }

        var obj = (0, _url.parse)(url);
        var filename = obj.pathname;
        var contents = _fs2['default'].readFileSync(filename);

        var ext = _path2['default'].extname(filename);
        obj.pathname = (0, _lodashTemplate2['default'])(name, { interpolate: /\[(.+?)\]/g })({
          ext: ext,
          hash: md5(contents),
          name: _path2['default'].basename(filename, ext)
        });

        _this.push(new _vinyl2['default']({
          path: obj.pathname,
          contents: contents
        }));

        return (0, _url.format)(obj);
      };

      var sourceMapComment = _convertSourceMap2['default'].fromObject(file.sourceMap).toComment({ multiline: true });
      var contents = file.contents.toString() + sourceMapComment;
      var result = (0, _rework2['default'])(contents, { source: file.relative }).use((0, _reworkPluginUrl2['default'])(handle)).toString({ sourcemap: true, sourcemapAsObject: true });

      file.contents = new Buffer(result.code);

      // Apply sourcemaps...
      if (file.sourceMap) {
        result.map.file = file.relative;
        var map = _convertSourceMap2['default'].fromObject(result.map).toJSON();
        (0, _vinylSourcemapsApply2['default'])(file, map);
      }

      this.push(file);
    } catch (error) {
      this.emit('error', error);
    }

    callback();
  });
};

exports['default'] = compile;
module.exports = exports['default'];