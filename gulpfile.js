const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('babel',function(){
    gulp.src('./es/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./js'))
});

gulp.task('watch', function(){
    gulp.watch('./es/*.js', ['babel'])
});
  
gulp.task('default', ['babel']);
