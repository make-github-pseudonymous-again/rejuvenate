import updateScripts from '../recipes/update-scripts-definition.js';

const description = 'Lint sources in script.';

const commit = {
	type: 'config',
	scope: 'travis',
	subject: description,
};

const scripts = {
	travis: {
		oldDefinition: 'npm run cover',
		newDefinition: 'npm run lint && npm run cover',
	},
};

const dependencies = ['config:lint-setup'];

const {postcondition, precondition, apply} = updateScripts({scripts});

export {description, commit, postcondition, precondition, apply, dependencies};
