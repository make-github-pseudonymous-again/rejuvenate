import update from '../lib/update.js';

export const description = 'Customize commit message.';

export const commit = {
	type: 'config',
	scope: 'release',
	subject: description,
};

const key = 'release';
const actual = 'np';
const expected = "np --message ':hatching_chick: release: Bumping to v%s.'";

export async function postcondition({readPkg, assert}) {
	const {scripts} = await readPkg();
	assert(scripts[key] === expected);
}

export async function precondition({readPkg, assert}) {
	const {scripts} = await readPkg();
	assert(scripts[key] === actual);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.scripts[key] = expected;
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup'];
