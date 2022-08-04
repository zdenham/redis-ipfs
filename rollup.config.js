import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyFills from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import clientPkg from './packages/client/package.json';

const browserClient = {
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
    }),
    typescript(),
    nodePolyFills(),
  ],
};

export default [
  // THE BROWSER CLIENT
  browserClient,
  // THE BROWSER CLIENT (FOR CDN)
  {
    ...browserClient,
    output: {
      ...browserClient.output,
      file: `dist/rip-client.es-browser${clientPkg.version}.js`,
    },
  },
  // THE NODE CLIENT
  {
    input: './packages/client/index.ts',
    external: (id) => !/^[./]/.test(id),
    output: {
      file: `packages/client/dist/rip-client.es-node.js`,
      format: 'esm',
      intro: 'console.log("IMPORTING RIP CLIENT NODE ESM")',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [typescript()],
  },
  // THE NODE SERVER CLIENT
  {
    input: './packages/server/index.ts',
    external: (id) => !/^[./]/.test(id),
    output: {
      file: `packages/server/dist/rip-server.es-node.js`,
      format: 'esm',
      intro: 'console.log("IMPORTING RIP SERVER NODE ESM")',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [typescript()],
  },
];
