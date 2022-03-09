import update from '../lib/update.js';
import {
	includes,
	replaceOrInsert,
	presetDefaults,
	pluginRemoveDebug,
	presetCurrentNode,
	format,
} from '../lib/babel.js';

export const description = 'Setup default presets.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel;
	assert(env !== undefined);
	assert(env.presets !== undefined);
	assert(includes(env.presets, presetDefaults));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel;
	assert(!includes(env?.plugins, pluginRemoveDebug));
	assert(!includes(env?.presets, presetCurrentNode));
	assert(!includes(env?.presets, presetDefaults));
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			const env = pkgjson.babel;
			replaceOrInsert(env, 'presets', presetDefaults);
			return format(pkgjson);
		},
	});
	await fixConfig();
}

export const dependencies = [
	'config:lint-setup',
	'package.json:ensure-babel',
	'deps:add-@babel-preset-env',
];
