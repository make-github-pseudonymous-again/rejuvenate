export const description = 'Lint source files.';

export const commit = {
	subject: description,
};

export async function postcondition({lintSources, assert}) {
	try {
		await lintSources();
	} catch (error) {
		assert.fail(error.message);
	}
}

export async function precondition({lintSources, assert}) {
	try {
		await lintSources();
		assert.fail();
	} catch {}
}

export async function apply({fixSources}) {
	await fixSources();
}

export const dependencies = ['package.json:setup-xo'];
