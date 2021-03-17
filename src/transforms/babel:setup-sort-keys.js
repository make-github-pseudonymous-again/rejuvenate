import update from '../lib/update.js';

export const description = 'Sort keys.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

const expected = ['sourceMaps', 'presets'];

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert.deepStrictEqual(
		Object.keys(pkgjson.babel).slice(0, expected.length),
		expected,
	);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert.notDeepStrictEqual(
		Object.keys(pkgjson.babel).slice(0, expected.length),
		expected,
	);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			// SORT BABEL KEYS
			pkgjson.babel = {
				sourceMaps: true,
				presets: [],
				...pkgjson.babel,
			};
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = [
	'config:lint-setup',
	'babel:setup-sourcemaps',
	'babel:setup-presets',
	'package.json:ensure-babel-env',
];
