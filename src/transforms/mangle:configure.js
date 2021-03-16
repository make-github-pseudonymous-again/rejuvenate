import update from '../lib/update.js';
import contains from '../lib/contains.js';

const filename = 'mangle.json';
export const description = `Create ${filename}.`;

export const commit = {
	type: 'config',
	scope: 'mangle',
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
	minify: {
		mangle: {
			properties: {
				regex: '^_[^_]',
			},
		},
	},
	props: {
		props: {},
	},
};
