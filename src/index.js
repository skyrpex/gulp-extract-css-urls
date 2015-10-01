import fs              from 'fs';
import {parse, format} from 'url';
import path            from 'path';
import File            from 'vinyl';
import rework          from 'rework';
import {createHash}    from 'crypto';
import through2        from 'through2';
import deepmerge       from 'deepmerge';
import template        from 'lodash.template';
import url             from 'rework-plugin-url';
import convertSourceMap  from 'convert-source-map';
import applySourceMap  from 'vinyl-sourcemaps-apply';

const md5 = buffer => createHash('md5').update(buffer.toString()).digest('hex');

// [name].[hash][ext]

const compile = (name = '[hash][ext]') => {

  return through2.obj(function(file, enc, callback) {
    try {
      const handle = url => {
        // Ignore data URLs.
        if (url.match(/^data:/)) {
          return url;
        }

        const obj = parse(url);
        const filename = obj.pathname;
        const contents = fs.readFileSync(filename);

        const ext = path.extname(filename);
        obj.pathname = template(name, { interpolate: /\[(.+?)\]/g })({
          ext,
          hash: md5(contents),
          name: path.basename(filename, ext),
        });

        this.push(new File({
          path: obj.pathname,
          contents,
        }));

        return format(obj);
      };

      const sourceMapComment = convertSourceMap
        .fromObject(file.sourceMap)
        .toComment({ multiline: true });
      const contents = file.contents.toString() + sourceMapComment;
      const result = rework(contents, { source: file.relative })
        .use(url(handle))
        .toString({ sourcemap: true, sourcemapAsObject: true });

      file.contents = new Buffer(result.code);

      // Apply sourcemaps...
      if (file.sourceMap) {
        result.map.file = file.relative;
        const map = convertSourceMap.fromObject(result.map).toJSON();
        applySourceMap(file, map);
      }

      this.push(file);
    } catch (error) {
      this.emit('error', error);
    }

    callback();
  });

};

export default compile;
