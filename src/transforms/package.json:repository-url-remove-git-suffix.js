import update from '../lib/update.js';

export const description = 'Remove .git suffix of repository URL.';

export const commit = {
	scope: 'package.json',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const repository = pkgjson.repository;
	assert(!repository?.url?.endsWith('.git'));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const repository = pkgjson.repository;
	assert(repository?.type === 'git' && repository?.url?.endsWith('.git'));
}

export async function apply({readPkg, writePkg}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.repository.url = pkgjson.repository.url.replace(/\.git$/, '');
			return pkgjson;
		},
	});
}
