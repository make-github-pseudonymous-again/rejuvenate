import update from '../lib/update.js';
import * as pkg from '../lib/pkg.js';

export const description = 'Configure microbundle outputs (exports).';

export const commit = {
	type: 'build',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('microbundle'));
	assert(pkgjson.bin === undefined);
	assert(pkgjson.main !== undefined);
	assert(pkgjson.module !== undefined);
	assert(pkgjson.esmodule !== undefined);
	assert(pkgjson['umd:main'] !== undefined);
	assert(pkgjson.exports !== undefined);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('microbundle'));
	assert(pkgjson.bin === undefined);
	assert(pkgjson.main !== undefined);
	assert(pkgjson.module !== undefined);
	assert(pkgjson.esmodule !== undefined);
	assert(pkgjson['umd:main'] !== undefined);
	assert(pkgjson.exports === undefined);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.exports = {
				'.': {
					browser: `./${pkgjson.module}`,
					umd: `./${pkgjson['umd:main']}`,
					require: `./${pkgjson.main}`,
					default: `./${pkgjson.esmodule}`,
				},
			};
			return pkgjson;
		},
	});

	await fixConfig();
}

export const dependencies = [
	'config:lint-setup',
	'build:use-microbundle',
	'build:microbundle-configure-outputs-module',
	'build:microbundle-configure-outputs-esmodule',
	'build:microbundle-configure-outputs-umd:main',
];
