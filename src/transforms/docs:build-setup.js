import * as pkg from '../lib/pkg.js';
import update from '../lib/update.js';

export const description = 'Add build-docs script.';

export const commit = {
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const {scripts} = await readPkg();
	assert(scripts['build-docs'] !== undefined);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const {scripts} = pkgjson;
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('esdoc'));
	assert(scripts['build-docs'] === undefined);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.scripts['build-docs'] = 'esdoc';
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup'];
