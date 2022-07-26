// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'index.ts',
  output: {
    dir: '.',
    format: 'umd',
    name: 'rip',
  },
  plugins: [typescript()],
};
