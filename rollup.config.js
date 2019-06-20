// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import { terser } from "rollup-plugin-terser";
import url from "rollup-plugin-url"
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

const prod = (process.env.NODE_ENV === 'production');

const plugins = prod ? [
  resolve(),
  babel(),
  json(),
  url(),
  terser({
    module: true,
    compress: {
      arrows: false // for safari 9.3
    }
  }),
] : [
  resolve(),
  babel(),
  json(),
  url(),
  serve({
    host: '0.0.0.0',
    contentBase: 'www'
  }),
  livereload(),
]

export default {
  input: 'example/index.js',
  output: {
    dir: 'www/build',
    format: 'esm'
  },
  plugins
};
