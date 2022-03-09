import updateScripts from '../recipes/update-scripts-definition.js';

const description = 'Update debug script.';

const commit = {
	scope: 'package.json',
	subject: description,
};

const scripts = {
	debug: {
		oldDefinition: 'NODE_ENV=debug npm test -- -- -- -st --fail-fast',
		newDefinition: 'NODE_ENV=debug npm run test -- -st --fail-fast',
	},
};

const dependencies = ['package.json:scripts-add-debug'];

const {postcondition, precondition, apply} = updateScripts({scripts});

export {description, commit, postcondition, precondition, apply, dependencies};
