import addScripts from '../recipes/add-scripts.js';

const dep = 'babel-plugin-unassert';
const description = `Add devDependency ${dep}.`;

const commit = {
	scope: 'package.json',
	subject: description,
};

const deps = [dep];

const dependencies = ['config:lint-setup'];

const {postcondition, precondition, apply} = addScripts({deps});

export {postcondition, precondition, apply, description, commit, dependencies};
