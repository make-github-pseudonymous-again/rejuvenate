export const description = 'Lint configuration files.';

export const commit = {
	subject: description,
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
