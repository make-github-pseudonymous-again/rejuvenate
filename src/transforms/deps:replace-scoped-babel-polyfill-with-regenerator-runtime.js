import * as pkg from '../lib/pkg.js';
import update from '../lib/update.js';

export const description =
	'Replace all references to @babel/polyfill by references to regenerator-runtime/runtime.';

export const commit = {
	type: 'deps',
	subject: 'Use regenerator-runtime instead of @babel/polyfill.',
};

const oldDep = '@babel/polyfill';
const newDep = 'regenerator-runtime';

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
		edit: (pkgjson) => {
			pkg.replaceDep(pkgjson, oldDep, newDep);
			if (pkgjson.ava?.require) {
				pkgjson.ava.require = pkgjson.ava.require.map((x) =>
					x === oldDep ? `${newDep}/runtime` : x,
				);
			}

			return pkgjson;
		},
	});

	await upgrade(newDep);
	await fixConfig();
	await install();
}

export const dependencies = [
	'config:lint-setup',
	'deps:replace-unscoped-babel-packages-with-scoped-babel-packages',
];
