import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyFills from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'browser.ts',
    output: {
      file: 'dist/rip.es-browser.js',
      format: 'esm',
      intro: 'console.log("IMPORTING RIP BROWSER ESM")',
      sourcemap: true,
    },
    plugins: [
      commonjs(),
      nodeResolve({
        browser: true,
      }),
      typescript(),
      nodePolyFills(),
    ],
  },
  {
    input: 'index.ts',
    output: {
      file: 'dist/rip.es-node.js',
      format: 'esm',
      intro: 'console.log("IMPORTING RIP NODE ESM")',
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
