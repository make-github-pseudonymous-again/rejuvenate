import update from '../lib/update.js';

export const description = 'Configure xo.';

export const commit = {
	scope: 'package.json',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.xo !== undefined);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.xo === undefined);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.xo = xoConfig;
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['config:lint-setup', 'deps:add-xo'];

const xoConfig = {
	prettier: true,
	plugins: ['unicorn'],
	rules: {
		'unicorn/filename-case': 'off',
	},
	overrides: [
		{
			files: ['doc/**'],
			env: 'browser',
		},
	],
};
