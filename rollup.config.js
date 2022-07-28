// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyFills from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default {
  input: 'index.ts',
  output: {
    dir: '.',
    format: 'umd',
    name: 'rip',
  },
  plugins: [
    commonjs(),
    nodePolyFills(),
    typescript(),
    replace({
      // allows wallet connect to work (via lit protocol)
      global: 'window',
    }),
  ],
};
