import update from '../lib/update.js';

export const description = 'Remove custom automerge key for major bumps.';

export const commit = {
	type: 'config',
	scope: 'renovate.json',
	subject: description,
};

const type = 'major';
const key = 'automerge';
const filename = 'renovate.json';

export async function postcondition({readJSON, assert}) {
	const config = await readJSON(filename);
	assert(config[type]?.[key] === undefined);
}

export async function precondition({readJSON, assert}) {
	const config = await readJSON(filename);
	assert(config[type]?.[key] !== undefined);
}

export async function apply({readJSON, writeJSON}) {
	await update({
		read: () => readJSON(filename),
		write: (data) => writeJSON(filename, data),
		edit: (config) => {
			delete config[type][key];
			if (Object.keys(config[type]).length === 0) {
				delete config[type];
			}

			return config;
		},
	});
}

export const dependencies = ['renovate:use-shared-config'];
