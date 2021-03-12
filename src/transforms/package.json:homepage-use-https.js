import update from '../lib/update.js';

export const description = 'Use https for homepage in package.json.';

export const commit = {
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const homepage = pkgjson.homepage;
	assert(!homepage || homepage.startsWith('https:'));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const homepage = pkgjson.homepage;
	assert(homepage && homepage.startsWith('http:'));
}

export async function apply({readPkg, writePkg}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			pkgjson.homepage = pkgjson.homepage.replace(/^http:/, 'https:');
			return pkgjson;
		},
	});
}
