import update from '../lib/update.js';

export const description = 'Remove ignores.';

export const commit = {
	type: 'config',
	scope: 'xo',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.xo?.ignores === undefined);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.xo?.ignores !== undefined);
}

export async function apply({readPkg, writePkg}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			delete pkgjson.xo.ignores;
			return pkgjson;
		},
	});
}
