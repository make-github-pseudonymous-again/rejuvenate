import {isSorted} from '@comparison-sorting/is-sorted';
import {inverse, toObject} from '@iterable-iterator/mapping';
import {enumerate} from '@iterable-iterator/zip';

import {fixedOrder} from './order.js';

export const order = fixedOrder(
	toObject(
		inverse(enumerate(['files', 'nodeArguments', 'require', 'timeout'])),
	),
	([k]) => k,
);

export const sortKeys = (object) => {
	return Object.fromEntries(Object.entries(object).sort(order));
};

export const areKeysSorted = (object) => {
	const keys = Object.entries(object);
	return isSorted(order, keys, 0, keys.length);
};
