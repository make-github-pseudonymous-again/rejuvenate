import update from '../lib/update.js';
import replace from '../lib/text/replace.js';

export const description = 'Set type to module in `package.json`.';

export const commit = {
	type: 'config',
	scope: 'build',
	subject: description,
};

const key = 'type';
const expected = 'module';

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[key] === expected);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[key] === undefined || pkgjson[key] === 'commonjs');
}

export async function apply({
	readPkg,
	writePkg,
	fixConfig,
	lintSources,
	read,
	write,
}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson[key] = expected;
			return pkgjson;
		},
	});
	await fixConfig();
	await replace(
		[
			// TODO split this into new transform
			['require(', () => 'await import('],
			[
				"'regenerator-runtime/runtime'",
				() => "'regenerator-runtime/runtime.js'",
			],
			[
				'"regenerator-runtime/runtime"',
				() => "'regenerator-runtime/runtime.js'",
			],
		],
		['doc/manual/usage.md'],
		{
			read,
			write,
			method: replace.all,
		},
	);
	await lintSources();
}

export const dependencies = [
	'config:lint-setup',
	'commitlint:config-use-cjs-extension',
	'build:microbundle-configure-outputs-add-cjs',
];
