import del from 'del'
import gulp from 'gulp'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import webpack from 'webpack-stream'
import cleanCss from 'gulp-clean-css'
import minifyHtml from 'gulp-htmlmin'
import browserSync from 'browser-sync'
import autoPrefixer from 'gulp-autoprefixer'
import groupCssMediaQueries from 'gulp-group-css-media-queries'

const { init, stream } = browserSync
const { task, series, parallel, watch, src, dest } = gulp

const srcFolder = './src'
const buildFolder = './dist'

const path = {
	build: {
		js: `${buildFolder}/js`,
		html: `${buildFolder}/`,
		css: `${buildFolder}/css/`,
		images: `${buildFolder}/img/`,
		files: `${buildFolder}/files/`,
		fonts: `${buildFolder}/fonts/`,
	},
	src: {
		html: `${srcFolder}/*.html`,
		js: `${srcFolder}/js/script.js`,
		svg: `${srcFolder}/img/**/*.svg`,
		files: `${srcFolder}/files/**/*.*`,
		scss: `${srcFolder}/scss/style.scss`,
		svgicons: `${srcFolder}/svgicons/*.svg`,
		images: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp}`,
		fonts: `${srcFolder}/fonts/*.{woff2,woff,ttf,otf,eot,svg}`,
	},
	watch: {
		js: `${srcFolder}/js/**/*.js`,
		html: `${srcFolder}/**/*.html`,
		files: `${srcFolder}/files/**/*.*`,
		scss: `${srcFolder}/scss/**/*.scss`,
		svgicons: `${srcFolder}/svgicons/*.svg`,
		images: `${srcFolder}/img/**/*.{jpg,jpeg,png,gif,webp,svg,ico}`,
	},
	clean: buildFolder,
}

const reset = () => {
	return del(path.clean)
}

const server = () => {
	init({
		server: {
			baseDir: path.build.html,
		},
		notify: false,
		port: 7000,
	})
}

const html = () => {
	return src(path.src.html)
		.pipe(minifyHtml({ collapseWhitespace: true }))
		.pipe(dest(path.build.html))
		.pipe(stream())
}

const sass = gulpSass(dartSass)

const scss = () => {
	return src(path.src.scss)
		.pipe(sass({
			sourceComments: false,
			outputStyle: 'expanded',
		}))
		.pipe(autoPrefixer({
			grid: true,
			flexbox: true,
			cascade: true,
			ovverideBrowserslist: [ 'last 8 versions' ]
		}))
		.pipe(groupCssMediaQueries())
		.pipe(cleanCss())
		.pipe(dest(path.build.css))
		.pipe(stream())
}


const js = () => {
	return src(path.src.js)
		.pipe(webpack({
			mode: 'production',
			output: {
				filename: 'script.js'
			}
		}))
		.pipe(dest(path.build.js))
		.pipe(stream())
}

const img = () => {
	return src(path.src.images)
		.pipe(dest(path.build.images))
}

const fonts = () => {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
}

const watcher = () => {
	watch(path.watch.html, html)
	watch(path.watch.scss, scss)
	watch(path.watch.js, js)
}

const mainTasks = series(parallel(html, scss, js), img, fonts)

const dev = series(reset, mainTasks, parallel(server, watcher))

task('default', dev)

// import '../../gulp2022/gulpfile'