let gulp = require("gulp");
let rename = require("gulp-rename");
let concat = require('gulp-concat');
let sourcemaps = require('gulp-sourcemaps');
let uglify = require('gulp-uglify-es').default;


var uglifyOptions = {
    toplevel: true,
    compress: {
        global_defs: {
            "@console.log": "alert"
        },
        passes: 2
    },
    output: {
        beautify: false,
        preamble: "/* uglified */"
    }
}

// gulp.task("uglify", function () {
//     return gulp.src("lib/bundle.js")
//         .pipe(rename("bundle.min.js"))
//         .pipe(uglify(/* options */))
//         .pipe(gulp.dest("lib/"));
// });

gulp.task('js', function(){
  return gulp.src('test/*.js')
    // .pipe(sourcemaps.init())
    // .pipe(concat('app.min.js'))
		.pipe(uglify(uglifyOptions))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('test/build'))
});

gulp.task('default', [ 'js' ]);
