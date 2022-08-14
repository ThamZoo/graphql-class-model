import fs from 'fs';
import path, { dirname } from 'path';

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import gen from '@babel/generator';
import tmp from '@babel/template';
import t from '@babel/types';

import util from 'util';

function log(value, depth = 0) {
  console.log(util.inspect(value, { showHidden: false, depth, colors: true }));
}

// TODO
// 1. Support TS paths resolve
// 2. Parse external Type or file
// 3. Move to better faster parser like swc

export function classMeta(
  opt = {
    name: '__metadata__',
    filter: /\.model(.ts|.js)?/,
  },
) {
  return {
    name: 'model',
    setup(build) {
      //inject global decorator like __decorator like tsc -- emitDecorator flag
      build.initialOptions.inject = ['./bin/decorator.js', ...(build.initialOptions?.inject || [])];

      build.onResolve({ filter: opt.filter }, (args) => {
        const fileLocation = path.resolve(args.resolveDir, dirname(args.path));

        const files = fs.readdirSync(fileLocation, { encoding: 'utf8' });

        const [file] = files.filter((fileName) => opt.filter.test(fileName));

        if (!file) {
          throw new Error('No file found');
        }

        const folder = dirname(path.resolve(args.resolveDir, args.path));

        return {
          path: path.join(folder, file),
          namespace: 'model',
          pluginData: {
            file: file,
            path: folder,
          },
        };
      });

      build.onLoad({ filter: opt.filter, namespace: 'model' }, async (args) => {
        try {
          const text = await fs.promises.readFile(args.path, 'utf8');

          const tree = parse(text, { plugins: ['typescript', 'decorators-legacy'], sourceType: 'module' });
          traverse.default(tree, {
            enter(path) {
              if (path.type == 'ImportDeclaration') {
                // log(path);
              }
              if (path.key == 'imported') {
                // log(path);
              }

              if (t.isClassBody(path.node)) {
                const metadata = path.node.body.reduce((metadata, node) => {
                  if (t.isClassProperty(node)) {
                    const { type, typeName } = node?.typeAnnotation?.typeAnnotation || {};

                    if (type) {
                      const typeToString = type + (typeName ? `#${typeName?.name}` : '');
                      metadata.push(`${node.key.name}:'${typeToString}'`);
                    }
                  }

                  // toArray
                  if (t.isClassMethod(node)) {
                    const args = node.params.reduce((args, p) => {
                      const { type, typeName } = p?.typeAnnotation?.typeAnnotation || {};
                      const typeToString = type + (typeName ? `#${typeName?.name}` : '');
                      args.push(`${p.name}:'${typeToString}'`);
                      return args;
                    }, []);

                    metadata.push(`${node.key.name}: {${args.join(',')}}`);
                  }

                  return metadata;
                }, []);

                const ast = tmp.default.ast(`ast = {${metadata.join(',')}}`);

                ast.expression.left.name = `static ${opt.name}`; // insert static hack

                path.get('body')[0].parentPath.unshiftContainer('body', ast);
              }
            },
          });

          return {
            contents: gen.default(tree, text).code,
            loader: 'ts',
            resolveDir: args.pluginData.path,
          };
        } catch (error) {
          console.log(error);
        }
      });
    },
  };
}
