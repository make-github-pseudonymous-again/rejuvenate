export const description =
	'Replace all references to babel-preset-latest by references to @babel/preset-env.';

export const commit = {
	subject: 'Use @babel/preset-env instead of babel-preset-latest.',
};

export async function postcondition({lintConfig, assert}) {
	try {
		await lintConfig();
	} catch (error) {
		assert.fail(error.message);
	}
}

export async function precondition({lintConfig, assert}) {
	try {
		await lintConfig();
		assert.fail();
	} catch {}
}

export async function apply({fixConfig}) {
	await fixConfig();
}

export const dependencies = ['fixpack:configure'];
