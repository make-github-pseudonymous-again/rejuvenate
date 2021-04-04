import updateScripts from '../recipes/update-scripts-definition.js';

const description = 'Add text reporters in coverage script.';

const commit = {
	type: 'config',
	scope: 'package.json',
	subject: description,
};

const scripts = {
	cover: {
		oldDefinition: 'NODE_ENV=cover c8 --all --src src --reporter=lcov npm test',
		newDefinition:
			'NODE_ENV=cover c8 --all --src src --reporter lcov --reporter text-summary --reporter text npm test',
	},
};

const dependencies = ['coverage:use-custom-node-env'];

const {postcondition, precondition, apply} = updateScripts({scripts});

export {description, commit, postcondition, precondition, apply, dependencies};
