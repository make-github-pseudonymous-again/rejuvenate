import addScripts from '../recipes/add-scripts.js';

const description = 'Add lint script.';

const scripts = {
	lint: 'xo',
};

const commit = {
	scope: 'package.json',
	subject: description,
};

const dependencies = ['deps:add-xo'];

const {postcondition, precondition, apply} = addScripts({scripts});

export {postcondition, precondition, apply, description, commit, dependencies};
