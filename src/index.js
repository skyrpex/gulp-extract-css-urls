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
import applySourceMap  from 'vinyl-sourcemaps-apply';

const md5 = buffer => createHash('md5').update(buffer.toString()).digest('hex');

// [name].[hash][ext]

const compile = (name = '[hash][ext]') => {

  return through2.obj(function(file, enc, callback) {

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

    const result = rework(file.contents.toString())
      .use(url(handle))
      .toString({ sourcemap: true, sourcemapAsObject: true });

    file.contents = new Buffer(result.code);

    // TODO Apply sourcemaps... It doesn't work for now.
    // if (file.sourceMap) {
    //   applySourceMap(file, result.map.toString());
    // }

    this.push(file);
    callback();

  });

};

export default compile;
