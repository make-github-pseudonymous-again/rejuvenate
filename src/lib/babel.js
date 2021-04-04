import {fixedOrder} from './order.js';

const string = (x) => JSON.stringify(x);
export const includes = (array, item) => {
	if (typeof item === 'string') return array?.includes(item);
	// eslint-disable-next-line unicorn/no-array-callback-reference
	return array?.map(string).includes(string(item));
};

const pair = (item) => (typeof item === 'string' ? [item, undefined] : item);
const key = (item) => pair(item)[0];
const compress = (k, v) => (v === undefined ? k : [k, v]);
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

const sortToTop = {
	[presetEnv]: 0,
};

const order = fixedOrder(sortToTop, key);

export const replaceOrInsert = (array, item) =>
	array ? [...replaceOrInsertGen(array, item)].sort(order) : [item];

export const remove = (array, key) =>
	array && [...removeGen(array, key)].sort(order);
