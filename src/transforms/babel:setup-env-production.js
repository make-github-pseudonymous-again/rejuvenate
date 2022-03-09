import update from '../lib/update.js';
import {
	includes,
	replaceOrInsert,
	pluginUnassert,
	pluginRemoveDebug,
	format,
} from '../lib/babel.js';

export const description = 'Setup production environment.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel?.env?.production;
	assert(env !== undefined);
	assert(env.plugins !== undefined);
	assert(includes(env.plugins, pluginUnassert));
	assert(includes(env.plugins, pluginRemoveDebug));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel?.env?.production;
	assert(
		!includes(env?.plugins, pluginUnassert) ||
			!includes(env?.plugins, pluginRemoveDebug),
	);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			const env = pkgjson.babel.env.production;
			replaceOrInsert(env, 'plugins', pluginUnassert);
			replaceOrInsert(env, 'plugins', pluginRemoveDebug);
			return format(pkgjson);
		},
	});
	await fixConfig();
}

export const dependencies = [
	'config:lint-setup',
	'babel:setup-presets',
	'deps:add-babel-plugin-unassert',
	'deps:add-babel-plugin-transform-remove-console',
	'package.json:ensure-babel-env-production',
];
