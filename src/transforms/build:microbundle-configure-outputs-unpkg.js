import update from '../lib/update.js';

export const description = 'Configure microbundle UNPKG output.';

export const commit = {
	scope: 'package.json',
	subject: description,
};

const key = 'unpkg';
const umd = 'umd:main';

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[key] === pkgjson[umd]);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[umd] !== undefined);
	assert(pkgjson[key] !== pkgjson[umd]);
}

export async function apply({readPkg, writePkg, fixConfig, remove, install}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson[key] = pkgjson[umd];
			return pkgjson;
		},
	});
	await remove(['dist/**']);
	await fixConfig();
	await install();
}

export const dependencies = [
	'config:lint-setup',
	'build:use-microbundle',
	'build:microbundle-configure-outputs-umd:main',
];
