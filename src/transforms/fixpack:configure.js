import update from '../lib/update.js';
import contains from '../lib/contains.js';
import stringify from '../lib/json/stringify.js';

const filename = '.fixpackrc';
export const description = `Update or create ${filename}.`;

export const commit = {
	type: 'config',
	scope: 'fixpack',
	subject: description,
};

export async function postcondition({readJSON, assert}) {
	await contains({
		assert,
		read: () => readJSON(filename),
		test: (contents) => assert.deepStrictEqual(contents, expected),
	});
}

export async function precondition({readJSON, assert}) {
	await contains({
		assert,
		read: () => readJSON(filename),
		mustExist: false,
		test: (contents) => assert.notDeepStrictEqual(contents, expected),
	});
}

export async function apply({read, write}) {
	await update({
		create: true,
		read: () => read(filename),
		write: (data) => write(filename, data),
		edit: () => stringify(expected) + '\n',
	});
}

export const dependencies = ['deps:add-fixpack'];

const expected = {
	files: ['package.json'],
	quiet: false,
	required: ['name', 'version'],
	requiredOnPrivate: [],
	sortToTop: [
		'name',
		'description',
		'version',
		'license',
		'author',
		'homepage',
		'repository',
		'bugs',
		'keywords',
		'sideEffects',
		'type',
		'source',
		'main',
		'module',
		'esmodule',
		'umd:main',
		'unpkg',
		'exports',
		'files',
		'scripts',
		'bundledDependencies',
		'dependencies',
		'optionalDependencies',
		'peerDependencies',
		'peerDependenciesMeta',
		'devDependencies',
	],
	sortedSubItems: [
		'keywords',
		'exports',
		'files',
		'scripts',
		'bundledDependencies',
		'dependencies',
		'optionalDependencies',
		'peerDependencies',
		'peerDependenciesMeta',
		'devDependencies',
	],
	warn: [
		'description',
		'author',
		'repository',
		'keywords',
		'main',
		'bugs',
		'homepage',
		'license',
		'files',
	],
	warnOnPrivate: ['name', 'version', 'description', 'main'],
	dryRun: false,
	wipe: false,
	indent: null,
	newLine: null,
	finalNewLine: null,
};
