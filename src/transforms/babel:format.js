import update from '../lib/update.js';
import {format} from '../lib/babel.js';

export const description = 'Initial formatting.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const expected = JSON.stringify(pkgjson.babel);
	const actual = JSON.stringify(format(pkgjson).babel);
	assert.deepStrictEqual(actual, expected);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const expected = JSON.stringify(pkgjson.babel);
	const actual = JSON.stringify(format(pkgjson).babel);
	assert.notDeepStrictEqual(actual, expected);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: format,
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup', 'package.json:ensure-babel'];
