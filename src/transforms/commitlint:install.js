import addScripts from '../recipes/add-scripts.js';

const description = 'Install and configure `commitlint`.';

const commit = {
	type: 'config',
	scope: 'git',
	subject: description,
};

const scripts = {};

const deps = ['@commitlint/cli', '@js-library/commitlint-config'];

const files = {
	'.commitlintrc.js': `
module.exports = {
	extends: ['@js-library']
};
`,
};

const dependencies = ['config:lint-setup'];

const {postcondition, precondition, apply} = addScripts({scripts, deps, files});

export {postcondition, precondition, apply, description, commit, dependencies};
