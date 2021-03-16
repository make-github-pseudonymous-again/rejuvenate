import addScripts from '../recipes/add-scripts.js';

const description = 'Configure pre-commit hook.';

const commit = {
	type: 'config',
	scope: 'husky',
	subject: description,
};

const scripts = {
	precommit: 'lint-staged',
};

const deps = ['lint-staged'];

const config = {
	'lint-staged': {
		'*.js': ['npm run lint-and-fix'],
		'package.json': ['npm run lint-config-and-fix'],
	},
};

const files = {
	'.husky/pre-commit': `
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run precommit
`,
};

const dependencies = [
	'config:lint-setup',
	'sources:lint-setup',
	'husky:configure',
];

const {postcondition, precondition, apply} = addScripts({
	scripts,
	deps,
	files,
	config,
});

export {postcondition, precondition, apply, description, commit, dependencies};
