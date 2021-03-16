import removeScripts from '../recipes/remove-scripts.js';

const description = 'Remove esdoc script.';

const commit = {
	type: 'cleaning',
	scope: 'package.json',
	subject: description,
};

const scripts = ['esdoc'];

const dependencies = ['docs:build-setup'];

const {postcondition, precondition, apply} = removeScripts({scripts});

export {postcondition, precondition, apply, description, commit, dependencies};
