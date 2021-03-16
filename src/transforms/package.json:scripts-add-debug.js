import addScripts from '../recipes/add-scripts.js';

const description = 'Add debug script.';

const scripts = {
	debug: 'NODE_ENV=debug npm run test -- -st --fail-fast',
};

const commit = {
	scope: 'package.json',
	subject: description,
};

const dependencies = ['config:lint-setup', 'babel:setup-env'];

const {postcondition, precondition, apply} = addScripts({scripts});

export {postcondition, precondition, apply, description, commit, dependencies};
