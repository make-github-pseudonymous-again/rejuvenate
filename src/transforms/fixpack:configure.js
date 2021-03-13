import update from '../lib/update.js';

export const description = 'Update or create.';

export const commit = {
	type: 'config',
	scope: 'fixpack',
	subject: description,
};

const filename = '.fixpackrc';

export async function postcondition({readJSON, assert}) {
	try {
		const config = await readJSON(filename);
		assert.deepStrictEqual(config, expected);
	} catch (error) {
		if (error instanceof assert.AssertionError) throw error;
		if (error.code !== 'ENOENT') throw error;
		assert.fail(error.message);
	}
}

export async function precondition({readJSON, assert}) {
	try {
		const config = await readJSON(filename);
		assert.notDeepStrictEqual(config, expected);
	} catch (error) {
		if (error instanceof assert.AssertionError) throw error;
		if (error.code !== 'ENOENT') throw error;
	}
}

export async function apply({read, write}) {
	await update({
		create: true,
		read: () => read(filename),
		write: (data) => write(filename, data),
		edit: () => JSON.stringify(expected, undefined, 2) + '\n',
	});
}

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
		'files',
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
