import update from '../lib/update.js';

export const description = 'Upgrade AVA to v5.';

export const commit = {
	type: 'deps',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(devDependencies.ava?.startsWith('5.'));
}

export async function precondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(devDependencies.ava?.startsWith('4.'));
}

export async function apply({readPkg, writePkg, fixConfig, upgrade, install}) {
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
}

export const dependencies = ['ava:upgrade-from-3-to-4'];