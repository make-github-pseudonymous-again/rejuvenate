import addScripts from '../recipes/add-scripts.js';

const description = 'Add lint-config script.';

const scripts = {
	'lint-config': 'fixpack --dryRun',
};

const commit = {
	scope: 'package.json',
	subject: description,
};

const dependencies = ['deps:add-fixpack'];

const {postcondition, precondition, apply} = addScripts({
	scripts,
	lintConfig: false,
});

export {postcondition, precondition, apply, description, commit, dependencies};
