import rangeSubset from 'semver/ranges/subset.js';

import update from '../lib/update.js';
import {sortKeys} from '../lib/ava.js';
import {remove, replaceOrInsert} from '../lib/babel.js';
import {addDevDep, removeDevDep} from '../lib/pkg.js';

export const description = 'Replace @babel/register with @node-loader/babel.';

export const commit = {
	type: 'config',
	scope: 'ava',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(devDependencies['@babel/register'] === undefined);
	assert(devDependencies['@node-loader/babel'] !== undefined);
}

export async function precondition({readPkg, assert}) {
	const {devDependencies} = await readPkg();
	assert(devDependencies.ava !== undefined);
	assert(rangeSubset(devDependencies.ava, '>=4.0.0'));
}

export async function apply({readPkg, writePkg, fixConfig, install, test}) {
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
			pkgjson.ava = sortKeys(pkgjson.ava);
			remove(pkgjson.babel, 'presets', '@babel/preset-env');

			return pkgjson;
		},
	});
	await fixConfig();
	await install();
	await test();
}

export const dependencies = ['ava:setup-v4'];
