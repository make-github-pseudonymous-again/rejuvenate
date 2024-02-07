import updateScripts from '../recipes/update-scripts-definition.js';

const description = 'Replace `husky install` with `husky` in install hooks.';

const commit = {
	type: 'config',
	scope: 'package.json',
	subject: description,
};

const scripts = {
	'install-hooks': {
		oldDefinition: 'husky install',
		newDefinition: 'husky',
	},
};

const dependencies = ['husky:ensure-v9-or-later'];

const {postcondition, precondition, apply} = updateScripts({scripts});

export {description, commit, postcondition, precondition, apply, dependencies};
