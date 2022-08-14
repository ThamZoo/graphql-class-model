#!/usr/bin/env node --experimental-json-modules --no-warnings

import { build } from 'esbuild';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import pkg from '../package.json' assert { type: 'json' }; // -- experiment json module

build({
  entryPoints: ['./src/index.ts'],
  outdir: './public/build',
  bundle: true,
  minify: true,
  target: 'es2015',
  color: true,
  format: 'iife',
  loader: {
    '.json': 'json',
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.scss': 'css',
    '.vert': 'text',
    '.frag': 'text',
    '.model.ts': '',
  },
  color: true,
  define: { __VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    sassPlugin({
      type: 'css',
      filter: /.(s[ac]ss|css)$/,
      transform: postcssModules({
        // ...put here the options for postcss-modules: https://github.com/madyankin/postcss-modules
      }),
    }),
  ],
})
  .then(() => {})
  .catch(() => process.exit(1));
