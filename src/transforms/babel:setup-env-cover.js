import update from '../lib/update.js';
import {
	includes,
	replaceOrInsert,
	presetCurrentNode,
	presetPowerAssert,
	pluginRemoveDebug,
	format,
} from '../lib/babel.js';

export const description = 'Setup cover environment.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

const sourceMaps = 'both';

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel?.env?.cover;
	assert(env !== undefined);
	assert(env.sourceMaps === sourceMaps);
	assert(env.presets !== undefined);
	assert(env.plugins !== undefined);
	assert(includes(env.presets, presetCurrentNode));
	assert(includes(env.presets, presetPowerAssert));
	assert(includes(env.plugins, pluginRemoveDebug));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel?.env?.cover;
	assert(
		env?.sourceMaps !== sourceMaps ||
			!includes(env?.presets, presetCurrentNode) ||
			!includes(env?.presets, presetPowerAssert) ||
			!includes(env?.plugins, pluginRemoveDebug),
	);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			const env = pkgjson.babel.env.cover;
			env.sourceMaps = sourceMaps;
			replaceOrInsert(env, 'presets', presetCurrentNode);
			replaceOrInsert(env, 'presets', presetPowerAssert);
			replaceOrInsert(env, 'plugins', pluginRemoveDebug);
			return format(pkgjson);
		},
	});
	await fixConfig();
}

export const dependencies = [
	'config:lint-setup',
	'babel:setup-presets',
	'deps:add-babel-preset-power-assert',
	'deps:add-babel-plugin-transform-remove-console',
	'package.json:ensure-babel-env-cover',
];
