import update from '../lib/update.js';

export const description = 'Sort environments keys.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

const expected = ['debug', 'test', 'development', 'production'];

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert.deepStrictEqual(
		Object.keys(pkgjson.babel.env).slice(0, expected.length),
		expected,
	);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert.notDeepStrictEqual(
		Object.keys(pkgjson.babel.env).slice(0, expected.length),
		expected,
	);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			const babel = pkgjson.babel;
			const env = babel.env;

			// SORT BABEL.ENV KEYS
			babel.env = {
				debug: env.debug,
				test: env.test,
				development: env.development,
				production: env.production,
				...env,
			};

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
