import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description =
	'This is needed because the new ESM import syntax requires full paths.';

export const commit = {
	type: 'docs',
	subject: 'Correctly import regenerator/runtime.',
};

const docs = 'doc/manual/*.md';
const needle = "import 'regenerator-runtime/runtime'";
const replacement = "import 'regenerator-runtime/runtime.js'";

export async function postcondition({read, assert, glob}) {
	const found = await find([needle], glob(docs), {read, method: find.exact});
	assert(!found);
}

export async function precondition({read, assert, glob}) {
	const found = await find([needle], glob(docs), {read, method: find.exact});
	assert(found);
}

export async function apply({read, write, glob}) {
	const operations = [[needle, () => replacement]];
	await replace(operations, glob(docs), {read, write, method: replace.all});
}

export const dependencies = [
	'docs:replace-scoped-babel-polyfill-with-regenerator-runtime',
];
