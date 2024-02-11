import update from '../lib/update.js';
import {sortKeys} from '../lib/ava.js';
import {replaceOrInsert, remove as removeKey} from '../lib/babel.js';
import {addDevDep} from '../lib/pkg.js';
import find from '../lib/text/find.js';
import replace from '../lib/text/replace.js';
import findCode from '../lib/code/find.js';
import replaceCode from '../lib/code/replace.js';

export const description = 'Allow to test build with AVA.';

export const commit = {
	type: 'config',
	scope: 'ci',
	subject: description,
};

const readme = 'README.md';
const oldBadge = (repository, branch = 'main') =>
	`[![Tests](https://img.shields.io/github/workflow/status/${repository}/ci:cover?event=push&label=tests)](https://github.com/${repository}/actions/workflows/ci:cover.yml?query=branch:${branch})`;
const newBadge = (repository, branch = 'main') =>
	`[![Tests](https://img.shields.io/github/workflow/status/${repository}/ci?event=push&label=tests)](https://github.com/${repository}/actions/workflows/ci.yml?query=branch:${branch})`;

const slug = ({url}) => url.match(/\/([^/]+\/[^/]+)$/)[1];

const PLACEHOLDER_MODULE = '#module';

const importMap = (path) => ({
	imports: {
		[PLACEHOLDER_MODULE]: `./${path}`,
	},
});

const loaderPath = 'test/loader/config.js';
const loaderConfig = `
import * as babelLoader from '@node-loader/babel';
import * as importMapLoader from '@node-loader/import-maps';

const config = {
	loaders: [importMapLoader, babelLoader],
};

export default config;
`;

const importMaps = {
	'src/index.json': 'src/index.js',
	'dist/index.json': 'dist/index.cjs',
	'dist/index.modern.json': 'dist/index.modern.js',
	'dist/index.module.json': 'dist/index.module.js',
};

const oldBuildWorkflowPath = '.github/workflows/ci:build.yml';
const newBuildWorkflowPath = '.github/workflows/ci.yml';
const newBuildWorkflowDefinition = `
name: ci

on:
  - push
  - pull_request

jobs:

  build:
    name: Continuous integration (build)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install 📦
        uses: bahmutov/npm-install@v1
        with:
          install-command: yarn --frozen-lockfile --ignore-scripts
          useRollingCache: true

      - name: Build 🏗️
        run: yarn build

      - name: Archive build 💽
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist
          retention-days: 1

  test:
    needs: ["build"]
    name: Continuous integration (tests)
    runs-on: ubuntu-latest
    strategy:
      matrix:
        bundle: ["modern", "module", "cjs"]
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install 📦
        uses: bahmutov/npm-install@v1
        with:
          install-command: yarn --frozen-lockfile --ignore-scripts
          useRollingCache: true

      - name: Load build 💽
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist

      - name: Test 🔬
        run: yarn test:\${{ matrix.bundle }}
`;

const patterns = ['test/src/**/*.js'];
const SOURCE_MODULE = './src/index.js';

const filter =
	(resolveFromFile, resolveRequire) =>
	(node, {is, n}) => {
		if (is(node, n.ImportDeclaration) || is(node, n.ExportAllDeclaration)) {
			if (!is(node.source, n.Literal)) return false;
			const source = node.source.value;
			if (typeof source !== 'string') return false;
			const path = node.loc?.lines?.name;
			if (typeof path !== 'string') return false;
			const resolved = resolveRequire(path, source);
			if (!resolved.startsWith('.')) return false;
			const absolute = resolveFromFile(path, resolved);
			return absolute === SOURCE_MODULE;
		}

		return false;
	};

const map = (node, {b}) => {
	node.source = b.literal(PLACEHOLDER_MODULE);
	return node;
};

export async function postcondition({
	readPkg,
	assert,
	read,
	exists,
	resolveFromFile,
	resolveRequire,
	glob,
	debug,
}) {
	const {ava, repository} = await readPkg();
	assert(ava !== undefined);
	debug('ava is not undefined');
	const repo = slug(repository);
	assert(
		!(await find([oldBadge(repo)], [readme], {
			read,
			method: find.exact,
		})),
	);
	debug('old badge is not there');
	assert(
		await find([newBadge(repo)], [readme], {
			read,
			method: find.exact,
		}),
	);
	debug('new badge is there');
	assert(!(await exists(oldBuildWorkflowPath)));
	debug('old build workflow is gone');
	assert(await exists(newBuildWorkflowPath));
	debug('new build workflow is there');
	assert(
		!(await findCode(
			[{filter: filter(resolveFromFile, resolveRequire)}],
			glob(patterns),
			{
				read,
			},
		)),
	);
	debug('there are no more relative src/index import statements in test files');
}

export async function precondition({
	readPkg,
	assert,
	exists,
	read,
	resolveFromFile,
	resolveRequire,
	glob,
}) {
	const {ava, scripts, repository} = await readPkg();
	assert(ava !== undefined);
	assert(scripts?.test === 'ava');
	const repo = slug(repository);
	assert(
		await find([oldBadge(repo)], [readme], {
			read,
			method: find.exact,
		}),
	);
	assert(
		!(await find([newBadge(repo)], [readme], {
			read,
			method: find.exact,
		})),
	);
	assert(await exists(oldBuildWorkflowPath));
	assert(!(await exists(newBuildWorkflowPath)));
	assert(
		await findCode(
			[{filter: filter(resolveFromFile, resolveRequire)}],
			glob(patterns),
			{
				read,
			},
		),
	);
}

export async function apply({
	read,
	write,
	readJSON,
	writeJSON,
	remove,
	readPkg,
	writePkg,
	fixConfig,
	fixSources,
	install,
	resolveFromFile,
	resolveRequire,
	glob,
}) {
	await update({
		create: true,
		overwrite: false,
		read: () => read(loaderPath),
		write: (data) => write(loaderPath, data),
		edit: () => loaderConfig.trim() + '\n',
	});
	for (const [path, source] of Object.entries(importMaps)) {
		const importMapPath = `test/import-maps/${path}`;
		// eslint-disable-next-line no-await-in-loop
		await update({
			create: true,
			overwrite: false,
			read: () => readJSON(importMapPath),
			write: (data) => writeJSON(importMapPath, data),
			edit: () => importMap(source),
		});
	}

	await update({
		create: true,
		overwrite: false,
		read: () => read(newBuildWorkflowPath),
		write: (data) => write(newBuildWorkflowPath, data),
		edit: () => newBuildWorkflowDefinition.trim() + '\n',
	});

	const {repository} = await readPkg();
	const repo = slug(repository);
	const operations = [[oldBadge(repo), () => newBadge(repo)]];
	await replace(operations, [readme], {read, write, method: replace.all});
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			const {scripts} = pkgjson;
			scripts.test = 'npm run test:src';
			scripts['test-cmd'] = 'NODE_LOADER_CONFIG=test/loader/config.js ava';
			scripts['test:cjs'] =
				'IMPORT_MAP_PATH=test/import-maps/dist/index.json npm run test-cmd';
			scripts['test:dist'] =
				'npm run test:modern && npm run test:module && npm run test:cjs';
			scripts['test:modern'] =
				'IMPORT_MAP_PATH=test/import-maps/dist/index.modern.json npm run test-cmd';
			scripts['test:module'] =
				'IMPORT_MAP_PATH=test/import-maps/dist/index.module.json npm run test-cmd';
			scripts['test:src'] =
				'IMPORT_MAP_PATH=test/import-maps/src/index.json npm run test-cmd';

			delete scripts['ci:build'];
			delete scripts['ci:test'];

			addDevDep(pkgjson, '@node-loader/core', '2.0.0');
			addDevDep(pkgjson, '@node-loader/import-maps', '1.1.0');

			removeKey(
				pkgjson.ava,
				'nodeArguments',
				'--experimental-loader=@node-loader/babel',
			);
			replaceOrInsert(
				pkgjson.ava,
				'nodeArguments',
				'--experimental-loader=@node-loader/core',
			);
			pkgjson.ava = sortKeys(pkgjson.ava);
			return pkgjson;
		},
	});
	await fixConfig();
	await install();
	await remove([oldBuildWorkflowPath]);
	await replaceCode(
		[{filter: filter(resolveFromFile, resolveRequire), map}],
		glob(patterns),
		{
			read,
			write,
			printOptions: {quote: 'single'},
		},
	);
	await fixSources();
}

export const dependencies = [
	'ava:setup-v4',
	'ava:use-node-loader-babel',
	'github:workflow-configure-ci:build',
	'github:workflow-configure-ci:cover',
];
