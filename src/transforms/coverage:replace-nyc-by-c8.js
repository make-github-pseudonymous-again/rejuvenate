import * as pkg from '../lib/pkg.js';
import update from '../lib/update.js';

export const description = 'Use c8 instead of nyc.';

export const commit = {
	subject: description,
};

const oldDep = 'nyc';
const newDep = 'c8';

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(!devDeps.has(oldDep));
	assert(devDeps.has(newDep));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has(oldDep));
	assert(!devDeps.has(newDep));
}

export async function apply({readPkg, writePkg, upgrade, fixConfig, install}) {
	// Update package.json
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkg.replaceDep(pkgjson, oldDep, newDep);
			pkgjson.scripts.cover = pkgjson.scripts.cover.replace(
				oldDep,
				`${newDep} --all --src src`,
			);
			return pkgjson;
		},
	});

	await upgrade(newDep);
	await fixConfig();
	await install();
}

export const dependencies = ['config:lint-setup'];
