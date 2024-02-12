export const title = 'Configure microbundle outputs.';

export const dependencies = [
	'config:lint-setup',
	'build:use-microbundle',
	'build:microbundle-configure-outputs-module',
	'build:microbundle-configure-outputs-esmodule',
	'build:microbundle-configure-outputs-umd:main',
	'build:microbundle-configure-outputs-unpkg',
	'build:microbundle-configure-outputs-exports',
	'build:microbundle-configure-outputs-add-cjs',
	'build:microbundle-configure-outputs-remove-mjs-module',
	'build:microbundle-configure-outputs-remove-mjs-esmodule',
];
