import update from '../lib/update.js';

export const description = 'Use shared config.';

export const commit = {
	type: 'config',
	scope: 'renovate.json',
	subject: description,
};

const filename = 'renovate.json';
const key = 'extends';
const previous = ['config:base'];
const expected = ['github>aureooms/renovate-config-js-library'];

export async function postcondition({readJSON, assert}) {
	const config = await readJSON(filename);
	assert.deepStrictEqual(config[key], expected);
}

export async function precondition({readJSON, assert}) {
	const config = await readJSON(filename);
	assert.deepStrictEqual(config[key], previous);
}

export async function apply({readJSON, writeJSON}) {
	await update({
		read: () => readJSON(filename),
		write: (data) => writeJSON(filename, data),
		edit: (config) => {
			config[key] = expected;
			return config;
		},
	});
}
