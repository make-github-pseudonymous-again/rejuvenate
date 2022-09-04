import update from '../lib/update.js';
import {
	includes,
	replaceOrInsert,
	remove,
	presetEnv,
	presetCurrentNode,
	presetDefaults,
	transformRemoveConsole,
	pluginRemoveDebug,
	pluginKeepDebug,
	format,
} from '../lib/babel.js';

export const description = 'Refactor.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const babel = pkgjson?.babel;
	assert(includes(babel?.presets, presetCurrentNode));
	assert(includes(babel?.plugins, pluginRemoveDebug));
	const env = babel?.env;
	assert(!includes(env?.debug?.presets, presetCurrentNode));
	assert(includes(env?.debug?.plugins, pluginKeepDebug));
	assert(!includes(env?.test?.presets, presetCurrentNode));
	assert(!includes(env?.test?.plugins, pluginRemoveDebug));
	assert(!includes(env?.cover?.presets, presetCurrentNode));
	assert(!includes(env?.cover?.plugins, pluginRemoveDebug));
	assert(includes(env?.development?.presets, presetDefaults));
	assert(!includes(env?.development?.plugins, pluginRemoveDebug));
	assert(includes(env?.production?.presets, presetDefaults));
	assert(!includes(env?.production?.plugins, pluginRemoveDebug));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const babel = pkgjson?.babel;
	assert(!includes(babel?.presets, presetCurrentNode));
	assert(!includes(babel?.plugins, pluginRemoveDebug));
	const env = babel?.env;
	assert(includes(env?.debug?.presets, presetCurrentNode));
	assert(!includes(env?.debug?.plugins, pluginKeepDebug));
	assert(includes(env?.test?.presets, presetCurrentNode));
	assert(includes(env?.test?.plugins, pluginRemoveDebug));
	assert(includes(env?.cover?.presets, presetCurrentNode));
	assert(includes(env?.cover?.plugins, pluginRemoveDebug));
	assert(!includes(env?.development?.presets, presetDefaults));
	assert(includes(env?.development?.plugins, pluginRemoveDebug));
	assert(!includes(env?.production?.presets, presetDefaults));
	assert(includes(env?.production?.plugins, pluginRemoveDebug));
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			const babel = pkgjson.babel;
			replaceOrInsert(babel, 'presets', presetCurrentNode);
			replaceOrInsert(babel, 'plugins', pluginRemoveDebug);
			const env = babel.env;
			remove(env.debug, 'presets', presetEnv);
			replaceOrInsert(env.debug, 'plugins', pluginKeepDebug);
			remove(env.test, 'presets', presetEnv);
			remove(env.test, 'plugins', transformRemoveConsole);
			remove(env.cover, 'presets', presetEnv);
			remove(env.cover, 'plugins', transformRemoveConsole);
			replaceOrInsert(env.development, 'presets', presetDefaults);
			remove(env.development, 'plugins', transformRemoveConsole);
			if (env.development.plugins?.length === 0) delete env.development.plugins;
			replaceOrInsert(env.production, 'presets', presetDefaults);
			remove(env.production, 'plugins', transformRemoveConsole);
			return format(pkgjson);
		},
	});
	await fixConfig();
}

export const dependencies = [
	'babel:setup-presets',
	'babel:setup-sourcemaps',
	'babel:setup-debug-and-test-sourcemaps',
	'babel:setup-env-cover',
	'babel:setup-env-debug',
	'babel:setup-env-development',
	'babel:setup-env-production',
	'babel:setup-env-test',
];
