import update from '../lib/update.js';
import {format} from '../lib/babel.js';

export const description = 'Enable inline sourceMaps during tests.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.babel.sourceMaps === true);
	assert(pkgjson.babel.env.debug.sourceMaps === 'both');
	assert(pkgjson.babel.env.test.sourceMaps === 'both');
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.babel.sourceMaps === true);
	assert(pkgjson.babel.env.debug.sourceMaps === undefined);
	assert(pkgjson.babel.env.test.sourceMaps === undefined);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			const env = pkgjson.babel.env;
			env.debug.sourceMaps = 'both';
			env.test.sourceMaps = 'both';
			return format(pkgjson);
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup', 'babel:setup-sourcemaps'];
