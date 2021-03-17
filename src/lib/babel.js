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
	const [key, value] = pair(item);
	let found = false;
	// eslint-disable-next-line unicorn/no-array-callback-reference
	for (const [k, v] of array.map(pair)) {
		if (k === key) {
			found = true;
			yield compress(key, value);
		} else yield compress(k, v);
	}

	if (!found) yield compress(key, value);
}

const sortToTop = {
	'@babel/preset-env': 0,
};

const order = fixedOrder(sortToTop, key);

export const replaceOrInsert = (array, item) =>
	array ? [...replaceOrInsertGen(array, item)].sort(order) : [item];
