import update from '../lib/update.js';

export const description = 'Add test key in .babel.env.';

export const commit = {
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.babel?.env?.test);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(!pkgjson.babel?.env?.test);
}

export async function apply({readPkg, writePkg}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.babel.env.test = {};
			return pkgjson;
		},
	});
}

export const dependencies = ['package.json:ensure-babel-env'];
