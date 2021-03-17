import update from '../lib/update.js';

export const description = 'Enable sourceMaps files.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.babel.sourceMaps === true);
	assert(pkgjson.babel.env.debug.sourceMaps === undefined);
	assert(pkgjson.babel.env.test.sourceMaps === undefined);
	assert(pkgjson.babel.env.development.sourceMaps === undefined);
	assert(pkgjson.babel.env.production.sourceMaps === undefined);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.babel.sourceMaps === undefined);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			const babel = pkgjson.babel;
			babel.sourceMaps = true;
			const env = babel.env;
			delete env.debug.sourceMaps;
			delete env.test.sourceMaps;
			delete env.development.sourceMaps;
			delete env.production.sourceMaps;
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = [
	'config:lint-setup',
	'package.json:ensure-babel-env-test',
	'package.json:ensure-babel-env-debug',
	'package.json:ensure-babel-env-development',
	'package.json:ensure-babel-env-production',
];
