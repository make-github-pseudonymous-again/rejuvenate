import * as pkg from '../lib/pkg.js';
import replace from '../lib/replace.js';
import update from '../lib/update.js';

export const description =
	'Replace all references to babel-preset-latest by references to @babel/preset-env.';

export const commit = {
	subject: 'Use @babel/preset-env instead of babel-preset-latest.',
};

const oldDep = 'babel-preset-latest';
const newDep = '@babel/preset-env';

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

export async function apply({
	read,
	write,
	readPkg,
	writePkg,
	glob,
	upgrade,
	install,
}) {
	// Update package.json
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkg.replaceDep(pkgjson, oldDep, newDep);
			if (pkgjson.ava?.require) {
				pkgjson.ava.require = pkgjson.ava.require.map((x) =>
					x === oldDep ? `${newDep}` : x,
				);
			}

			return pkgjson;
		},
	});

	await upgrade(newDep);

	// Update docs
	const operations = [[oldDep, () => newDep]];
	await replace(operations, glob('doc/manual/*.md'), {
		read,
		write,
		method: replace.all,
	});

	await install();
}

export const dependencies = [
	'replace-unscoped-babel-packages-with-scoped-babel-packages',
];
