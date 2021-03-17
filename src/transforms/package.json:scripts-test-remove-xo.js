import updateScripts from '../recipes/update-scripts-definition.js';

const description = 'Remove xo call in test.';

const commit = {
	type: 'config',
	scope: 'package.json',
	subject: description,
};

const scripts = {
	test: {
		oldDefinition: 'xo && ava',
		newDefinition: 'ava',
	},
};

const dependencies = ['config:lint-setup'];

const {postcondition, precondition, apply} = updateScripts({scripts});

export {description, commit, postcondition, precondition, apply, dependencies};
