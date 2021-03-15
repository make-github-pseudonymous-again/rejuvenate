import * as pkg from '../lib/pkg.js';
import update from '../lib/update.js';

export const description = 'Setup fixpack for linting package.json.';

export const commit = {
	scope: 'package.json',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('fixpack'));
	assert(pkgjson.scripts?.['lint-config'] !== undefined);
	assert(pkgjson.scripts?.['lint-config-and-fix'] !== undefined);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(!devDeps.has('fixpack'));
	assert(pkgjson.scripts?.['lint-config'] === undefined);
	assert(pkgjson.scripts?.['lint-config-and-fix'] === undefined);
}

export async function apply({readPkg, writePkg, upgrade, install}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.devDependencies.fixpack = '0.0.0';
			pkgjson.scripts['lint-config'] = 'fixpack --dryRun';
			pkgjson.scripts['lint-config-and-fix'] = 'fixpack || fixpack';
			return pkgjson;
		},
	});
	await upgrade('fixpack');
	await install();
}
