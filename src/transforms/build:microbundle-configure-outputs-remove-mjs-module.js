import update from '../lib/update.js';
import * as pkg from '../lib/pkg.js';

export const description = 'Use `.js` extension for `module` build.';

export const commit = {
	type: 'build',
	subject: description,
};

const module = (extension) => `dist/index.module${extension}`;

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('microbundle'));
	assert(pkgjson.bin === undefined);
	assert(pkgjson.main === 'dist/index.cjs');

	assert(pkgjson.module === module('.js'));
	assert(pkgjson.exports?.['.']?.browser === `./${module('.js')}`);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('microbundle'));
	assert(pkgjson.bin === undefined);
	assert(pkgjson.main === 'dist/index.cjs');

	assert(pkgjson.module === module('.mjs'));
	assert(pkgjson.exports?.['.']?.browser === `./${module('.mjs')}`);
}

export async function apply({readPkg, writePkg, fixConfig, remove, install}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.module = module('.js');
			pkgjson.exports['.'].browser = `./${module('.js')}`;
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
	'build:microbundle-configure-outputs-module',
	'build:microbundle-configure-outputs-exports',
];
