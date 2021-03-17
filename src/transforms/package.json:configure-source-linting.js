export const title = 'Setup linting for source files.';

export const dependencies = [
	'deps:add-xo',
	'xo:config',
	'xo:config-remove-ignores',
	'prettier:config',
	'package.json:scripts-add-lint',
	'package.json:scripts-lint-use-xo',
	'package.json:scripts-add-lint-and-fix',
];
