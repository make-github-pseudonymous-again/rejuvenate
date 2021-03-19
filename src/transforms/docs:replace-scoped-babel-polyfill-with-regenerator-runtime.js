import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description =
	'Replace all references to @babel/polyfill by references to regenerator-runtime/runtime.';

export const commit = {
	type: 'docs',
	subject: 'Reference regenerator-runtime instead of @babel/polyfill.',
};

const manual = 'doc/manual/*.md';
const oldDep = '@babel/polyfill';
const newDep = 'regenerator-runtime';
const operations = [[oldDep, () => `${newDep}/runtime`]];
const patterns = [oldDep];

export async function postcondition({read, glob, assert}) {
	const found = await find(patterns, glob(manual), {
		read,
		method: find.exact,
	});
	assert(!found);
}

export async function precondition({read, glob, assert}) {
	const found = await find(patterns, glob(manual), {
		read,
		method: find.exact,
	});
	assert(found);
}

export async function apply({read, write, glob}) {
	await replace(operations, glob(manual), {
		read,
		write,
		method: replace.all,
	});
}

export const dependencies = [
	'deps:replace-scoped-babel-polyfill-with-regenerator-runtime',
];
