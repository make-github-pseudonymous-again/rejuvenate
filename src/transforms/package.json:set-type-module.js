import update from '../lib/update.js';
import replace from '../lib/text/replace.js';

export const description = 'Set type to module in package.json.';

export const commit = {
	type: 'config',
	scope: 'build',
	subject: description,
};

const key = 'type';
const expected = 'module';

const oldCommitLintConfig = '.commitlintrc.js';
const newCommitLintConfig = '.commitlintrc.cjs';

export async function postcondition({readPkg, exists, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[key] === expected);
	assert(!(await exists(oldCommitLintConfig)));
	assert(await exists(newCommitLintConfig));
}

export async function precondition({readPkg, exists, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson[key] === undefined);
	assert(!(await exists(newCommitLintConfig)));
	assert(await exists(oldCommitLintConfig));
}

export async function apply({readPkg, writePkg, fixConfig, move, read, write}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson[key] = expected;
			return pkgjson;
		},
	});
	await fixConfig();
	await move(oldCommitLintConfig, newCommitLintConfig);
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
}

export const dependencies = [
	'config:lint-setup',
	'build:microbundle-configure-esmodule',
	'husky:hook-configure-commit-msg',
];
