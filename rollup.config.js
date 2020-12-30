import glob from 'glob';
import path from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import command from 'rollup-plugin-command';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import bust from 'html-bust';

const production = !process.env.ROLLUP_WATCH;

const watcher = globs => ({
  buildStart() {
    for (const item of globs) {
      glob.sync(path.resolve(item)).forEach((filename) => {
        this.addWatchFile(filename);
      });
    }
  }
});

export default {
  input: 'src/scripts/main.js',
  output: {
    file: 'dist/scripts/main.min.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    watcher(['src/**/*.*']),
    replace({
      'process.env.NODE_ENV': process.env.NODE_ENV,
      ENVIRONMENT: process.env.NODE_ENV
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    nodeResolve(),
    production && terser(),
    copy({
      targets: [
        { src: 'src/assets/**/*', dest: 'dist/assets' },
        { src: 'src/index.html', dest: 'dist' }
      ]
    }),
    command([
      'npm run build:sass',
      () => new Promise(resolve => {
        bust(
          path.resolve('dist/index.html'),
          path.resolve('dist/index.html'),
          { urlHint: null, tagTypes: ['script', 'link'] },
          resolve
        );
      })
    ], { wait: true }),
    !production && serve({
      contentBase: 'dist',
      port: 3000
    }),
    !production && livereload('dist')
  ]
};
