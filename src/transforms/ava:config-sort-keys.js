import update from '../lib/update.js';
import {areKeysSorted, sortKeys} from '../lib/ava.js';

export const description = 'Sort keys.';

export const commit = {
	type: 'config',
	scope: 'ava',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(areKeysSorted(pkgjson.ava));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(!areKeysSorted(pkgjson.ava));
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.ava = sortKeys(pkgjson.ava);
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup'];
