import {fixedOrder} from './order.js';

/**
 * String.
 *
 * @param {any} x
 * @return {string}
 */
const string = (x) => JSON.stringify(x);

/**
 * Includes.
 *
 * @param {any[]} array
 * @param {any} item
 * @return {boolean}
 */
export const includes = (array, item) => {
	if (typeof item === 'string') return array?.includes(item);

	return array?.map(string).includes(string(item));
};

/**
 * Pair.
 *
 * @param {string|any[]} item
 * @return {any[]}
 */
const pair = (item) => (typeof item === 'string' ? [item, undefined] : item);
/**
 * Key.
 *
 * @param {string|any[]} item
 * @return {string}
 */
const key = (item) => pair(item)[0];

/**
 * Compress.
 *
 * @param {string} k
 * @param {any} v
 * @return {string|[string, any]}
 */
const compress = (k, v) => (v === undefined ? k : [k, v]);

/**
 * ReplaceOrInsertGen.
 *
 * @param {any[]} array
 * @param {string|any[]} item
 */
function* replaceOrInsertGen(array, item) {
	yield* removeGen(array, key(item));
	yield item;
}

function* removeGen(array, key) {
	// eslint-disable-next-line unicorn/no-array-callback-reference
	for (const [k, v] of array.map(pair)) {
		if (k !== key) yield compress(k, v);
	}
}

export const presetEnv = '@babel/preset-env';
export const presetCurrentNode = [presetEnv, {targets: 'current node'}];
export const presetDefaults = [
	presetEnv,
	{targets: ['defaults', 'maintained node versions']},
];

export const presetPowerAssert = 'babel-preset-power-assert';
export const pluginUnassert = 'babel-plugin-unassert';

export const transformRemoveConsole = 'transform-remove-console';

export const pluginRemoveDebug = [
	transformRemoveConsole,
	{
		exclude: ['log', 'error', 'warn'],
	},
];

export const pluginKeepDebug = [
	transformRemoveConsole,
	{
		exclude: ['debug', 'log', 'error', 'warn'],
	},
];

const presetAndPluginSortToTop = {
	[presetEnv]: 0,
};

const presetAndPluginOrder = fixedOrder(presetAndPluginSortToTop, key);

/**
 * ReplaceOrInsert.
 *
 * @param {object} object
 * @param {string} arrayKey
 * @param {string|any[]} item
 */
export const replaceOrInsert = (object, arrayKey, item) => {
	const updated = replaceOrInsertFromArray(object[arrayKey], item);
	set(object, arrayKey, updated);
};

/**
 * ReplaceOrInsertFromArray.
 *
 * @param {any[]} array
 * @param {any} item
 */
export const replaceOrInsertFromArray = (array, item) =>
	array
		? [...replaceOrInsertGen(array, item)].sort(presetAndPluginOrder)
		: [item];

/**
 * Remove.
 *
 * @param {object} object
 * @param {string} arrayKey
 * @param {string} key
 */
export const remove = (object, arrayKey, key) => {
	const updated = removeFromArray(object[arrayKey], key);
	set(object, arrayKey, updated);
};

const set = (object, arrayKey, updated) => {
	if (updated === undefined) {
		delete object[arrayKey];
	} else {
		object[arrayKey] = updated;
	}
};

export const removeFromArray = (array, key) => {
	if (array === undefined || array.length === 0) return undefined;
	const updated = [...removeGen(array, key)].sort(presetAndPluginOrder);
	return updated.length === 0 ? undefined : updated;
};

const configSortToTop = {
	sourceMaps: 0,
	presets: 1,
	plugins: 2,
};

const envSortToTop = {
	debug: 0,
	test: 1,
	cover: 2,
	development: 3,
	production: 4,
};

export const envOrder = fixedOrder(envSortToTop, (x) => x[0]);
export const configOrder = fixedOrder(configSortToTop, (x) => x[0]);

export const sortObject = (object, compare) =>
	Object.fromEntries(Object.entries(object).sort(compare));

export const format = (pkgjson) => {
	const babel = pkgjson.babel;
	if (babel) {
		const env = babel.env;
		if (env) {
			for (const [key, value] of Object.entries(env)) {
				env[key] = sortObject(value, configOrder);
			}

			babel.env = sortObject(env, envOrder);
		}

		pkgjson.babel = sortObject(babel, configOrder);
	}

	return pkgjson;
};
