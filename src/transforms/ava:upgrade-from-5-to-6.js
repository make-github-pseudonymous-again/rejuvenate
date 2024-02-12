import update from '../lib/update.js';
import {replaceInArray} from '../lib/ava.js';

export const description = 'Upgrade AVA to v6.';

export const commit = {
	type: 'deps',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const {ava, devDependencies} = await readPkg();
	assert(devDependencies.ava?.startsWith('6.'));
	assert(ava?.require?.includes('regenerator-runtime/runtime.js'));
	assert(!ava?.require?.includes('regenerator-runtime/runtime'));
}

export async function precondition({readPkg, assert}) {
	const {ava, devDependencies} = await readPkg();
	assert(devDependencies.ava?.startsWith('5.'));
	assert(!ava?.require?.includes('regenerator-runtime/runtime.js'));
	assert(ava?.require?.includes('regenerator-runtime/runtime'));
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
			replaceInArray(
				pkgjson.ava,
				'require',
				'regenerator-runtime/runtime',
				'regenerator-runtime/runtime.js',
			);
			pkgjson.devDependencies.ava = '6.0.0';
			return pkgjson;
		},
	});
	await fixConfig();
	await upgrade('ava', {target: 'minor'});
	await install();
	await test();
}

export const dependencies = ['ava:upgrade-from-4-to-5'];
