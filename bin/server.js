#!/usr/bin/env node --experimental-json-modules --no-warnings

import { serve } from 'esbuild';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import pkg from '../package.json' assert { type: 'json' }; // -- experiment json module

import { classMeta } from './plugin.js';

serve(
  {
    port: 3000,
    servedir: './public',
  },
  {
    entryPoints: ['./src/index.ts'],
    outdir: './public/build',
    minify: false,
    bundle: true,
    target: 'es2015',
    loader: {
      '.json': 'json',
      '.ts': 'ts',
      '.tsx': 'tsx',
      '.scss': 'css',
      '.vert': 'text',
      '.frag': 'text',
    },
    color: true,
    define: { __VERSION__: JSON.stringify(pkg.version) },
    sourcemap: true,
    plugins: [
      classMeta(),
      sassPlugin({
        filter: /.module.(s[ac]ss|css)$/,
        transform: postcssModules({}),
      }),
    ],
  },
).then((result) => {
  console.log('- Refresh browser for changes ...');
});
