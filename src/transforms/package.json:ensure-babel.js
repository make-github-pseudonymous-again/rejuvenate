import update from '../lib/update.js';

export const description = 'Add babel key.';

export const commit = {
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.babel);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(!pkgjson.babel);
}

export async function apply({readPkg, writePkg}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.babel = {};
			return pkgjson;
		},
	});
}
