import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyFills from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default [
  {
    input: 'browser.ts',
    external: ['lit-js-sdk'], // if users want encryption they can install this module
    output: {
      file: 'dist/rip.es-browser.js',
      format: 'esm',
      intro: 'console.log("IMPORTING RIP BROWSER ESM");',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [
      nodeResolve({
        browser: true,
        exportConditions: ['require'],
      }),
      commonjs({
        esmExternals: true,
        strictRequires: true,
      }),
      typescript(),
      nodePolyFills(),
    ],
  },
  {
    input: 'index.ts',
    external: ['util'], // fixes circular dependency
    output: {
      file: 'dist/rip.es-node.js',
      format: 'esm',
      intro: 'console.log("IMPORTING RIP NODE ESM")',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [
      json(),
      typescript(),
      commonjs({
        esmExternals: true,
        strictRequires: true,
      }),
      nodeResolve({
        browser: false,
        preferBuiltins: true,
        exportConditions: ['require'],
      }),
    ],
  },
];
