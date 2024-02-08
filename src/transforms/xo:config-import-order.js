import update from '../lib/update.js';

export const description = 'Configure import/order.';

export const commit = {
	type: 'config',
	scope: 'xo',
	subject: description,
};

const key = 'import/order';
const value = [
	'error',
	{
		groups: [
			'builtin',
			'external',
			'internal',
			'parent',
			'sibling',
			'index',
			'object',
			'type',
		],
		pathGroups: [
			{
				pattern: 'ava',
				group: 'external',
				position: 'before',
			},
			{
				pattern: '#module',
				group: 'index',
				position: 'after',
			},
		],
		pathGroupsExcludedImportTypes: [],
		distinctGroup: true,
		'newlines-between': 'always',
		alphabetize: {
			order: 'asc',
			orderImportKind: 'asc',
			caseInsensitive: false,
		},
		warnOnUnassignedImports: true,
	},
];

export async function postcondition({readPkg, assert}) {
	const {xo} = await readPkg();
	assert(xo?.rules[key] !== undefined);
}

export async function precondition({readPkg, assert}) {
	const {xo} = await readPkg();
	assert(xo?.rules[key] === undefined);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.xo.rules[key] = value;
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['xo:config'];
