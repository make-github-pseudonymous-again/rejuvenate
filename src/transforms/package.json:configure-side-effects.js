import addScripts from '../recipes/add-scripts.js';

const description = 'Declare module side-effects free.';

const commit = {
	scope: 'package.json',
	subject: description,
};

const config = {
	sideEffects: false,
};

const dependencies = ['config:lint-setup'];

const {postcondition, precondition, apply} = addScripts({config});

export {postcondition, precondition, apply, description, commit, dependencies};
