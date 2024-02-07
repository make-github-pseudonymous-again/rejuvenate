import semver from 'semver';

import update from '../lib/update.js';

export const description = 'Upgrade Husky to v9.';

export const commit = {
	type: 'deps',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(devDependencies.husky !== undefined);
	assert(semver.satisfies(devDependencies.husky, '>=9.0.0'));
}

export async function precondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(devDependencies.husky !== undefined);
	assert(!semver.satisfies(devDependencies.husky, '>=9.0.0'));
}

export async function apply({readPkg, writePkg, fixConfig, upgrade, install}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.devDependencies.husky = '9.0.0';
			return pkgjson;
		},
	});
	await fixConfig();
	await upgrade('husky', {target: 'minor'});
	await install();
}

export const dependencies = ['config:lint-setup', 'husky:configure'];
