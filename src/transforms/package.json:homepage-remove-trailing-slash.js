import update from '../lib/update.js';

export const description = 'Remove trailing slash from homepage.';

export const commit = {
	scope: 'package.json',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const homepage = pkgjson.homepage;
	assert(!homepage || !homepage.endsWith('/'));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const homepage = pkgjson.homepage;
	assert(homepage && homepage.endsWith('/'));
}

export async function apply({readPkg, writePkg}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.homepage = pkgjson.homepage.replace(/\/$/, '');
			return pkgjson;
		},
	});
}
