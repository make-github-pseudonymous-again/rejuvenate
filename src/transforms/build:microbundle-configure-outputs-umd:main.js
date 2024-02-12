import update from '../lib/update.js';

export const description = 'Configure microbundle UMD output.';

export const commit = {
	scope: 'package.json',
	subject: description,
};

const key = 'umd:main';
const expected = 'dist/index.umd.js';

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[key] !== undefined);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[key] === undefined);
}

export async function apply({readPkg, writePkg, fixConfig, remove, install}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson[key] = expected;
			return pkgjson;
		},
	});
	await remove(['dist/**']);
	await fixConfig();
	await install();
}

export const dependencies = ['config:lint-setup', 'build:use-microbundle'];
