import update from '../lib/update.js';
import * as pkg from '../lib/pkg.js';

export const description = 'Fix main output file extension.';

export const commit = {
	type: 'build',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.main !== 'dist/index.js');
	assert(pkgjson.exports?.['.']?.require !== './dist/index.js');
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('microbundle'));
	assert(pkgjson.main === 'dist/index.js');
	assert(pkgjson.exports?.['.']?.require === './dist/index.js');
}

export async function apply({readPkg, writePkg, remove, fixConfig, install}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.main = 'dist/index.cjs';
			pkgjson.exports['.'].require = './dist/index.cjs';
			return pkgjson;
		},
	});
	await remove(['dist/**']);
	await fixConfig();
	await install();
}

export const dependencies = ['config:lint-setup'];
