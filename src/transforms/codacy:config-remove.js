const filename = '.codacy.yml';
export const description = `Remove ${filename}.`;

export const commit = {
	subject: description,
};

export async function postcondition({exists, assert}) {
	assert(!(await exists(filename)));
}

export async function precondition({exists, assert}) {
	assert(await exists(filename));
}

export async function apply({remove}) {
	await remove([filename]);
}
