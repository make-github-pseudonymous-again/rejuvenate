import updateScripts from '../recipes/update-scripts-definition.js';

const description = 'Use custom node environment in coverage script.';

const commit = {
	type: 'config',
	scope: 'package.json',
	subject: description,
};

const scripts = {
	cover: {
		oldDefinition: 'c8 --all --src src --reporter=lcov npm test',
		newDefinition: 'NODE_ENV=cover c8 --all --src src --reporter=lcov npm test',
	},
};

const dependencies = ['babel:refactor-config'];

const {postcondition, precondition, apply} = updateScripts({scripts});

export {description, commit, postcondition, precondition, apply, dependencies};
