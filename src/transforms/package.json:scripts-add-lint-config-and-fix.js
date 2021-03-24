import addScripts from '../recipes/add-scripts.js';

const description = 'Add lint-config-and-fix script.';

const scripts = {
	'lint-config-and-fix': 'fixpack || fixpack',
};

const commit = {
	scope: 'package.json',
	subject: description,
};

const dependencies = ['deps:add-fixpack'];

const {postcondition, precondition, apply} = addScripts({scripts});

export {postcondition, precondition, apply, description, commit, dependencies};
