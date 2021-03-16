import * as pkg from '../lib/pkg.js';
import update from '../lib/update.js';
import contains from '../lib/contains.js';

export const description = 'Setup husky.';

const scripts = {
	'install-hooks': 'husky install',
	postinstall: 'npm run install-hooks',
	postpublish: 'pinst --enable',
	prepublishOnly: 'pinst --disable',
};

const deps = ['husky', 'pinst'];

const gitignorePath = '.husky/.gitignore';
const gitignoreContents = '_';

export const commit = {
	type: 'config',
	scope: 'git-hooks',
	subject: description,
};

export async function postcondition({readPkg, read, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	for (const dep of deps) assert(devDeps.has(dep));
	for (const [key, value] of Object.entries(scripts)) {
		assert(pkgjson.scripts[key] === value);
	}

	await contains({
		assert,
		read: () => read(gitignorePath),
		test: (contents) => assert(contents === gitignoreContents.trim() + '\n'),
	});
}

export async function precondition({readPkg, exists, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	for (const dep of deps) assert(!devDeps.has(dep));
	for (const [key, value] of Object.entries(scripts)) {
		assert(pkgjson.scripts[key] !== value);
	}

	assert(!(await exists(gitignorePath)));
}

export async function apply({
	readPkg,
	writePkg,
	read,
	write,
	upgrade,
	fixConfig,
}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			for (const dep of deps) pkg.addDevDep(pkgjson, dep);
			for (const [key, value] of Object.entries(scripts))
				pkgjson.scripts[key] = value;
			return pkgjson;
		},
	});
	await update({
		create: true,
		overwrite: false,
		read: () => read(gitignorePath),
		write: (data) => write(gitignorePath, data),
		edit: () => gitignoreContents.trim() + '\n',
	});
	await upgrade(deps.join(' '));
	await fixConfig();
}

export const dependencies = ['config:lint-setup'];
