import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description =
	'Replace all references to unscoped babel-* packages by references to scoped @babel/* packages.';

export const commit = {
	type: 'docs',
	subject: 'Reference scoped babel packages.',
};

const manual = 'doc/manual/*.md';
const babelPackages = ['polyfill', 'register', 'cli', 'preset-env'];

const patterns = babelPackages.map((dep) => `babel-${dep}`);
const operations = babelPackages.map((dep) => [
	`babel-${dep}`,
	() => `@babel/${dep}`,
]);

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
	'deps:replace-unscoped-babel-packages-with-scoped-babel-packages',
];
