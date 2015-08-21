# Gulp Extract CSS URLs

Imports to the pipeline all the CSS assets included with url().

## Usage

```bash
npm install gulp-extract-css-urls --save-dev
```

```javascript
import gulp           from 'gulp';
import extractCssUrls from 'gulp-extract-css-urls';

// This will copy main.css along with its resources loaded with url().
gulp.task('default', () => {
  return gulp.src('main.css', { cwd: 'resources/assets/css/' })
    .pipe(extractCssUrls())
    .pipe(gulp.dest('public/assets/'));
});
```
