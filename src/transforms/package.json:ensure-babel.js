import update from '../lib/update.js';
import {format} from '../lib/babel.js';

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

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.babel = {};
			return format(pkgjson);
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup'];
