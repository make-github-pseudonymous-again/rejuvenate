import update from '../lib/update.js';
import contains from '../lib/contains.js';

const filename = 'tsconfig.json';
export const description = `Create ${filename}.`;

export const commit = {
	type: 'config',
	scope: 'typescript',
	subject: description,
};

export async function postcondition({readJSON, assert}) {
	await contains({
		assert,
		read: () => readJSON(filename),
		test: (contents) => assert.deepStrictEqual(contents, expected),
	});
}

export async function precondition({exists, assert}) {
	assert(!(await exists(filename)));
}

export async function apply({read, write}) {
	await update({
		create: true,
		overwrite: false,
		read: () => read(filename),
		write: (data) => write(filename, data),
		edit: () => JSON.stringify(expected, undefined, 2) + '\n',
	});
}

const expected = {
	$schema: 'https://json.schemastore.org/tsconfig',
	compilerOptions: {
		allowJs: true,
		emitDeclarationOnly: true,
		declaration: true,
		outDir: 'types',
		checkJs: true,
		target: 'es2020',
		module: 'es2020',
		moduleResolution: 'node',
		allowSyntheticDefaultImports: true,
	},
	include: ['src/**/*'],
};
