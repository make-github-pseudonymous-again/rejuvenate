import addScripts from '../recipes/add-scripts.js';

const description = 'Setup husky.';

const scripts = {
	'install-hooks': 'husky install',
	postinstall: 'npm run install-hooks',
	postpublish: 'pinst --enable',
	prepublishOnly: 'pinst --disable',
};

const deps = ['husky', 'pinst'];

const files = {
	'.husky/.gitignore': '_',
};

const commit = {
	type: 'config',
	scope: 'git-hooks',
	subject: description,
};

const dependencies = ['config:lint-setup'];

const {postcondition, precondition, apply} = addScripts({scripts, deps, files});

export {postcondition, precondition, apply, description, commit, dependencies};
