export const description = 'Lint source files.';

export const commit = {
	subject: description,
};

export async function postcondition({readPkg, lintSources, assert}) {
	const {scripts} = await readPkg();
	if (scripts.dev !== undefined || scripts.precommit !== undefined) return;
	try {
		await lintSources();
	} catch (error) {
		assert.fail(error.message);
	}
}

export async function precondition({readPkg, lintSources, assert}) {
	const {scripts} = await readPkg();
	if (scripts.dev !== undefined || scripts.precommit !== undefined) {
		assert.fail();
		return;
	}

	try {
		await lintSources();
		assert.fail();
	} catch {}
}

export async function apply({fixSources}) {
	await fixSources();
}

export const dependencies = [
	'codemod:use-esm-import-syntax',
	'package.json:configure-source-linting',
];
