import addScripts from '../recipes/add-scripts.js';

const dep = 'fixpack';
const description = `Add devDependency ${dep}.`;

const commit = {
	scope: 'package.json',
	subject: description,
};

const deps = [dep];

const {postcondition, precondition, apply} = addScripts({
	deps,
	lintConfig: false,
});

export {postcondition, precondition, apply, description, commit};
