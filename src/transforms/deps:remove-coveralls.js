import removeScripts from '../recipes/remove-scripts.js';

const dep = 'coveralls';
const description = `Remove devDependency ${dep}.`;

const commit = {
	type: 'deps',
	subject: description,
};

const deps = ['coveralls'];

const dependencies = ['github:workflow-configure-ci:test'];

const {postcondition, precondition, apply} = removeScripts({deps});

export {postcondition, precondition, apply, description, commit, dependencies};
