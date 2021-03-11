import update from '../lib/update.js';

export const description = 'Add production key in .babel.env.';

export const commit = {
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.babel?.env?.production);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(!pkgjson.babel?.env?.production);
}

export async function apply({readPkg, writePkg}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.babel.env.production = {};
			return pkgjson;
		},
	});
}

export const dependencies = ['package.json:ensure-babel-env'];
