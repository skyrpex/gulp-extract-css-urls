import fs from 'fs';
import path from 'path';
import File from 'vinyl';
import rework from 'rework';
import through2 from 'through2';
import tempfile from 'tempfile';
import deepmerge from 'deepmerge';
import {createHash} from 'crypto';
import {parse, format} from 'url';
import url from 'rework-plugin-url';
import applySourceMap from 'vinyl-sourcemaps-apply';

const md5 = buffer => createHash('md5').update(buffer.toString()).digest('hex');

const compile = (options = {}) => {

  return through2.obj(function(file, enc, callback) {

    console.log(file.cwd, file.base, file.path);

    const handle = url => {
      const obj = parse(url);
      const filename = obj.pathname;
      const contents = fs.readFileSync(filename);

      obj.pathname = `${md5(contents)}${path.extname(filename)}`;

      this.push(new File({
        path: obj.pathname,
        contents,
      }));

      return format(obj);
    };

    const result = rework(file.contents.toString())
      .use(url(handle))
      .toString({ sourcemap: true, sourcemapAsObject: true });

    // console.log(Object.keys(result));
    file.contents = new Buffer(result.code);

    // console.log(Object.keys(result.map));

    // if (file.sourceMap) {
      // applySourceMap(file, result.map.toString());
    // }

    this.push(file);
    callback();

  });

};

export default compile;
