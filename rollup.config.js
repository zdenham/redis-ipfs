import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyFills from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import clientPkg from './packages/client/package.json';

export default [
  // THE BROWSER CLIENT
  {
    input: 'packages/client/index.ts',
    external: ['lit-js-sdk'], // if users want encryption they can install this module
    output: {
      file: `packages/client/dist/rip-client.es-browser.js`,
      format: 'esm',
      intro: 'console.log("IMPORTING RIP CLIENT BROWSER ESM");',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [
      nodeResolve({
        browser: true,
      }),
      commonjs({
        esmExternals: true,
        strictRequires: true,
      }),
      typescript(),
      nodePolyFills(),
    ],
  },
  // THE BROWSER CLIENT (FOR CDN)
  {
    input: 'packages/client/index.ts',
    external: ['lit-js-sdk'], // if users want encryption they can install this module
    output: {
      file: `dist/rip-client.es-browser${clientPkg.version}.js`,
      format: 'esm',
      intro: 'console.log("IMPORTING RIP CLIENT BROWSER ESM");',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [
      nodeResolve({
        browser: true,
      }),
      commonjs({
        esmExternals: true,
        strictRequires: true,
      }),
      typescript(),
      nodePolyFills(),
    ],
  },
  // THE NODE CLIENT
  {
    input: 'packages/client/index.ts',
    external: ['util', 'lit-js-sdk'], // util - fixes circular dependency
    output: {
      file: `packages/client/dist/rip-client.es-node.js`,
      format: 'esm',
      intro: 'console.log("IMPORTING RIP CLIENT NODE ESM")',
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
  // THE NODE SERVER CLIENT
  {
    input: 'packages/server/index.ts',
    external: ['util'], // fixes circular dependency
    output: {
      file: `packages/server/dist/rip-server.es-node.js`,
      format: 'esm',
      intro: 'console.log("IMPORTING RIP SERVER NODE ESM")',
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
