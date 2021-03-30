import update from '../lib/update.js';

export const description = 'Configure microbundle ESM modern output.';

export const commit = {
	scope: 'package.json',
	subject: description,
};

const key = 'esmodule';
const expected = 'dist/index.modern.js';

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[key] === expected);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[key] === undefined);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson[key] = expected;
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup', 'build:use-microbundle'];
