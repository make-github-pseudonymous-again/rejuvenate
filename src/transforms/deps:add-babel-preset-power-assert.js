import addScripts from '../recipes/add-scripts.js';

const dep = 'babel-preset-power-assert';
const description = `Add devDependency ${dep}.`;

const commit = {
	scope: 'package.json',
	subject: description,
};

const deps = [dep];

const dependencies = ['config:lint-setup', 'deps:add-power-assert'];

const {postcondition, precondition, apply} = addScripts({deps});

export {postcondition, precondition, apply, description, commit, dependencies};
