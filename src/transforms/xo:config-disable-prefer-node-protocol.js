import update from '../lib/update.js';

export const description = 'Disable unicorn/prefer-node-protocol.';

export const commit = {
	type: 'config',
	scope: 'xo',
	subject: description,
};

const key = 'unicorn/prefer-node-protocol';
const value = 'off';

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.xo?.rules === undefined || pkgjson.xo.rules[key] === value);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.xo?.rules !== undefined && pkgjson.xo.rules[key] !== value);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.xo.rules[key] = value;
			return pkgjson;
		},
	});
	await fixConfig();
}
