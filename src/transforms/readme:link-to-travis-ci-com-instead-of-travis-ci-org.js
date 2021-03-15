import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description = 'Make travis-ci.org point to travis-ci.com.';

export const commit = {
	type: 'docs',
	scope: 'README.md',
	subject: description,
};

const filename = 'README.md';
const needle = '/travis-ci.org/';
const replacement = '/travis-ci.com/';

export async function postcondition({read, assert}) {
	const found = await find([needle], [filename], {read, method: find.exact});
	assert(!found);
}

export async function precondition({read, assert}) {
	const found = await find([needle], [filename], {read, method: find.exact});
	assert(found);
}

export async function apply({read, write}) {
	const operations = [[needle, () => replacement]];
	await replace(operations, [filename], {read, write, method: replace.all});
}
