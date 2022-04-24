import update from '../lib/update.js';

export const description = 'Sort keys.';

export const commit = {
	type: 'config',
	scope: 'ava',
	subject: description,
};

const prefix = new Set(['files', 'nodeArguments', 'require', 'timeout']);

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const keys = Object.keys(pkgjson.ava);
	const filtered = keys.filter((x) => prefix.has(x));
	const expected = keys.slice(0, filtered.length);
	assert.deepStrictEqual(filtered, expected);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const keys = Object.keys(pkgjson.ava);
	const filtered = keys.filter((x) => prefix.has(x));
	const expected = keys.slice(0, filtered.length);
	assert.notDeepStrictEqual(filtered, expected);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.ava = {
				files: [],
				nodeArguments: [],
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
