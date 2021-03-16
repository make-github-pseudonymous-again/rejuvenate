import update from '../lib/update.js';

export const description = 'Add dev script.';

export const commit = {
	scope: 'package.json',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const {scripts} = await readPkg();
	assert(scripts.dev !== undefined);
}

export async function precondition({readPkg, assert}) {
	const {scripts} = await readPkg();
	assert(scripts.dev === undefined);
	assert(scripts.test.startsWith('ava'));
	assert(scripts['lint-and-fix'] !== undefined);
	assert(scripts['lint-config-and-fix'] !== undefined);
	assert(scripts.cover !== undefined);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.scripts.dev =
				'npm run lint-config-and-fix && npm run lint-and-fix && npm run cover -- -- -st --fail-fast';
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup', 'sources:lint-setup'];
