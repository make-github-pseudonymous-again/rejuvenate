import update from '../lib/update.js';

export const description = 'Create renovate.json.';

export const commit = {
	type: 'config',
	scope: 'renovate',
	subject: description,
};

const filename = 'renovate.json';
const config = {extends: ['config:base']};

export async function postcondition({exists, assert}) {
	assert(await exists(filename));
}

export async function precondition({exists, assert}) {
	assert(!(await exists(filename)));
}

export async function apply({readJSON, writeJSON}) {
	await update({
		create: true,
		overwrite: false,
		read: () => readJSON(filename),
		write: (data) => writeJSON(filename, data),
		edit: () => config,
	});
}
