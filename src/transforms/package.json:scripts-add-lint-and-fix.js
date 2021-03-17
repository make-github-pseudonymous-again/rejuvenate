import addScripts from '../recipes/add-scripts.js';

const description = 'Add lint-and-fix script.';

const scripts = {
	'lint-and-fix': 'npm run lint -- --fix',
};

const commit = {
	scope: 'package.json',
	subject: description,
};

const dependencies = [
	'package.json:scripts-add-lint',
	'package.json:scripts-lint-use-xo',
];

const {postcondition, precondition, apply} = addScripts({scripts});

export {postcondition, precondition, apply, description, commit, dependencies};
