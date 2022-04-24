import update from '../lib/update.js';
import {remove, replaceOrInsert} from '../lib/babel.js';
import {addDevDep, removeDevDep} from '../lib/pkg.js';

export const description = 'Upgrade AVA to v4.';

export const commit = {
	type: 'deps',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(devDependencies.ava?.startsWith('4.'));
	assert(devDependencies['@babel/register'] === undefined);
	assert(devDependencies['@node-loader/babel'] !== undefined);
}

export async function precondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(
		devDependencies.ava?.startsWith('3.') ||
			devDependencies.ava?.startsWith('4.'),
	);
}

export async function apply({readPkg, writePkg, fixConfig, upgrade, install}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			removeDevDep(pkgjson, '@babel/register');
			remove(pkgjson.ava, 'require', '@babel/register');
			addDevDep(pkgjson, '@node-loader/babel', '2.0.1');
			replaceOrInsert(
				pkgjson.ava,
				'nodeArguments',
				'--experimental-loader=@node-loader/babel',
			);
			remove(pkgjson.babel, 'presets', '@babel/preset-env');
			if (!pkgjson.devDependencies.ava.startsWith('4.')) {
				pkgjson.devDependencies.ava = '4.0.0';
			}

			return pkgjson;
		},
	});
	await fixConfig();
	await upgrade('ava', {target: 'minor'});
	await install();
}

export const dependencies = [
	'config:lint-setup',
	'babel:refactor-config',
	'package.json:set-type-module',
];
