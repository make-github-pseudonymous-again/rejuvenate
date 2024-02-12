import update from '../lib/update.js';
import * as pkg from '../lib/pkg.js';

export const description = 'Use `.js` extension for `esmodule` build.';

export const commit = {
	type: 'build',
	subject: description,
};

const esmodule = (extension) => `dist/index.modern${extension}`;

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('microbundle'));
	assert(pkgjson.bin === undefined);
	assert(pkgjson.main === 'dist/index.cjs');

	assert(pkgjson.esmodule === esmodule('.js'));
	assert(pkgjson.exports?.['.']?.default === `./${esmodule('.js')}`);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('microbundle'));
	assert(pkgjson.bin === undefined);
	assert(pkgjson.main === 'dist/index.cjs');

	assert(pkgjson.esmodule === esmodule('.mjs'));
	assert(pkgjson.exports?.['.']?.default === `./${esmodule('.mjs')}`);
}

export async function apply({readPkg, writePkg, fixConfig, remove, install}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.esmodule = esmodule('.js');
			pkgjson.exports['.'].default = `./${esmodule('.js')}`;
			return pkgjson;
		},
	});

	await remove(['dist/**']);
	await fixConfig();
	await install();
}

export const dependencies = [
	'config:lint-setup',
	'package.json:set-type-module',
	'build:microbundle-configure-outputs-esmodule',
	'build:microbundle-configure-outputs-exports',
];
