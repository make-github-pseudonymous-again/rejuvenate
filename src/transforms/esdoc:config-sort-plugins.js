import update from '../lib/update.js';
import {fixedOrder} from '../lib/order.js';

const filename = '.esdoc.json';
export const description = 'Sort plugins.';

export const commit = {
	scope: filename,
	subject: description,
};

const key = (x) => x.name;
const sortToTop = {
	'esdoc-standard-plugin': 0,
	'esdoc-inject-style-plugin': 1,
	'esdoc-inject-script-plugin': 2,
};
const expected = Object.keys(sortToTop);

const order = fixedOrder(sortToTop, key);

export async function postcondition({readJSON, assert}) {
	const {plugins} = await readJSON(filename);
	assert.deepStrictEqual(
		// eslint-disable-next-line unicorn/no-array-callback-reference
		plugins.map(key).slice(0, expected.length),
		expected,
	);
}

export async function precondition({readJSON, assert}) {
	const {plugins} = await readJSON(filename);
	assert.notDeepStrictEqual(
		// eslint-disable-next-line unicorn/no-array-callback-reference
		plugins.map(key).slice(0, expected.length),
		expected,
	);
}

export async function apply({readJSON, writeJSON}) {
	await update({
		read: () => readJSON(filename),
		write: (config) => writeJSON(filename, config),
		edit(config) {
			config.plugins.sort(order);
			return config;
		},
	});
}

export const dependencies = ['esdoc:format-config-file'];
