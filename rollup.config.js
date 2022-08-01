import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyFills from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import pkg from './package.json';
// import replace from '@rollup/plugin-replace';

export default [
  // {
  //   input: 'browser.ts',
  //   output: {
  //     file: pkg.browser,
  //     format: 'umd',
  //     name: 'rip',
  //     intro: 'console.log("IMPORTING BROWSER")',
  //     sourcemap: true,
  //   },
  //   plugins: [commonjs(), nodePolyFills(), nodeResolve(), typescript(), json()],
  // },
  // {
  //   input: 'index.ts',
  //   output: {
  //     file: pkg.main,
  //     format: 'cjs',
  //     intro: 'console.log("IMPORTING CJS")',
  //     sourcemap: true,
  //   },
  //   plugins: [commonjs(), nodeResolve(), typescript(), json()],
  // },
  {
    input: 'browser.ts',
    output: {
      file: 'dist/rip.es-browser.js',
      format: 'esm',
      intro: 'console.log("IMPORTING BROWSER ESM")',
      sourcemap: true,
    },
    plugins: [
      commonjs(),
      nodeResolve({
        browser: true,
      }),
      typescript(),
    ],
  },
  {
    input: 'index.ts',
    output: {
      file: 'dist/rip.es-node.js',
      format: 'esm',
      intro: 'console.log("IMPORTING NODE ESM")',
      sourcemap: true,
    },
    plugins: [
      commonjs(),
      nodeResolve({
        browser: false,
      }),
      typescript(),
    ],
  },
];
