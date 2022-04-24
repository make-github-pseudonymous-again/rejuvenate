import update from '../lib/update.js';
import {format} from '../lib/babel.js';

export const description = 'Add env key in .babel.';

export const commit = {
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.babel?.env);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(!pkgjson.babel?.env);
}

export async function apply({readPkg, writePkg}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.babel.env = {};
			return format(pkgjson);
		},
	});
}

export const dependencies = ['package.json:ensure-babel'];
