export const description =
	'Replace all references to babel-preset-latest by references to @babel/preset-env.';

export const commit = {
	subject: 'Use @babel/preset-env instead of babel-preset-latest.',
};

export async function postcondition({lintPkg, assert}) {
	try {
		await lintPkg();
	} catch (error) {
		assert.fail(error.message);
	}
}

export async function precondition({lintPkg, assert}) {
	try {
		await lintPkg();
		assert.fail();
	} catch {}
}

export async function apply({fixPkg}) {
	await fixPkg();
}

export const dependencies = ['fixpack:configure'];
