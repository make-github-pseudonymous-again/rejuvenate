import update from '../lib/update.js';

export const description = 'Remove custom automerge key.';

export const commit = {
	type: 'config',
	scope: 'renovate.json',
	subject: description,
};

const filename = 'renovate.json';
const key = 'automerge';

export async function postcondition({readJSON, assert}) {
	const config = await readJSON(filename);
	assert(config[key] === undefined);
}

export async function precondition({readJSON, assert}) {
	const config = await readJSON(filename);
	assert(config[key] !== undefined);
}

export async function apply({readJSON, writeJSON}) {
	await update({
		read: () => readJSON(filename),
		write: (data) => writeJSON(filename, data),
		edit(config) {
			delete config[key];
			return config;
		},
	});
}

export const dependencies = ['renovate:use-shared-config'];
