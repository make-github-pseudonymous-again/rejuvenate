import update from '../lib/update.js';
import {sortKeys} from '../lib/ava.js';
import {replaceOrInsert, remove as removeKey} from '../lib/babel.js';
import {addDevDep} from '../lib/pkg.js';
import findCode from '../lib/code/find.js';
import replaceCode from '../lib/code/replace.js';

export const description = 'Allow to test build with AVA.';

export const commit = {
	type: 'config',
	scope: 'ava',
	subject: description,
};

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
	resolveFromFile,
	resolveRequire,
	glob,
	debug,
}) {
	const {ava} = await readPkg();
	assert(ava !== undefined);
	debug('ava is not undefined');
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
	read,
	resolveFromFile,
	resolveRequire,
	glob,
	debug,
}) {
	const {ava} = await readPkg();
	assert(ava !== undefined);
	debug('ava is not undefined');
	assert(
		await findCode(
			[{filter: filter(resolveFromFile, resolveRequire)}],
			glob(patterns),
			{
				read,
			},
		),
	);
	debug('there are relative src/index import statements in test files');
}

export async function apply({
	read,
	write,
	readJSON,
	writeJSON,
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
	'package.json:set-type-module',
	'ava:setup-v4',
	'ava:use-node-loader-babel',
	'github:workflow-configure-ci:build',
	'github:workflow-configure-ci:cover',
];
