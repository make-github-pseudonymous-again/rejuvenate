import update from '../lib/update.js';

export const description = 'Configure prettier.';

export const commit = {
	scope: 'package.json',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.prettier !== undefined);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.prettier === undefined);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.prettier = prettierConfig;
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup'];

const prettierConfig = {
	trailingComma: 'all',
};
