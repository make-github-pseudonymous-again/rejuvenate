import * as pkg from '../lib/pkg.js';
import update from '../lib/update.js';
import contains from '../lib/contains.js';
import parseYAML from '../lib/yaml/parse.js';

export const description =
	'Configure workflow to automate gh-pages generation.';
const script = 'npm run build-docs';

export const commit = {
	type: 'config',
	scope: 'github',
	subject: description,
};

export async function postcondition({readPkg, readYAML, assert}) {
	const {scripts} = await readPkg();
	assert(scripts['build-gh-pages'] === script);
	await contains({
		assert,
		read: () => readYAML(filename),
		test: (contents) => assert.deepStrictEqual(contents, parseYAML(config)),
	});
}

export async function precondition({readPkg, exists, assert}) {
	const pkgjson = await readPkg();
	const {scripts} = pkgjson;
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('esdoc'));
	assert(scripts['build-docs'] !== undefined);
	assert(scripts['build-gh-pages'] === undefined);
	assert(!(await exists(filename)));
}

export async function apply({readPkg, writePkg, read, write, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.scripts['build-gh-pages'] = script;
			return pkgjson;
		},
	});
	await update({
		create: true,
		overwrite: false,
		read: () => read(filename),
		write: (data) => write(filename, data),
		edit: () => config.trim() + '\n',
	});
	await fixConfig();
}

const filename = '.github/workflows/gh-pages.yml';
const config = `
name: Build and Deploy GitHub pages
on:
  release:
    types:
      - created
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v2

      - name: Install 🔧
        run: npm install

      - name: Build 🏗️
        run: npm run build-gh-pages

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@4.1.0
        with:
          branch: gh-pages
          folder: gh-pages
`;

export const dependencies = ['docs:build-setup'];
