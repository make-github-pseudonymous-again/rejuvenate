import rangeSubset from 'semver/ranges/subset.js';

import update from '../lib/update.js';

export const description = 'Upgrade AVA to v5.';

export const commit = {
	type: 'deps',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(devDependencies.ava !== undefined);
	assert(rangeSubset(devDependencies.ava, '>=5.0.0'));
}

export async function precondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(devDependencies.ava !== undefined);
	assert(rangeSubset(devDependencies.ava, '4.x'));
}

export async function apply({
	readPkg,
	writePkg,
	fixConfig,
	upgrade,
	install,
	test,
}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.devDependencies.ava = '5.0.0';
			return pkgjson;
		},
	});
	await fixConfig();
	await upgrade('ava', {target: 'minor'});
	await install();
	await test();
}

export const dependencies = ['ava:setup-v4'];
