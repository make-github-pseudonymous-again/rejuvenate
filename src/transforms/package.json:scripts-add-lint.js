import addScripts from '../recipes/add-scripts.js';

const description = 'Add lint script.';

const scripts = {
	lint: 'true',
};

const commit = {
	scope: 'package.json',
	subject: description,
};

const {postcondition, precondition, apply} = addScripts({scripts});

export {postcondition, precondition, apply, description, commit};
