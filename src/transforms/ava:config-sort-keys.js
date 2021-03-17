import update from '../lib/update.js';

export const description = 'Sort keys.';

export const commit = {
	type: 'config',
	scope: 'ava',
	subject: description,
};

const expected = ['files', 'require', 'timeout'];

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert.deepStrictEqual(
		Object.keys(pkgjson.ava).slice(0, expected.length),
		expected,
	);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert.notDeepStrictEqual(
		Object.keys(pkgjson.ava).slice(0, expected.length),
		expected,
	);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.ava = {
				files: [],
				require: [],
				timeout: '1m',
				...pkgjson.ava,
			};
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup'];
