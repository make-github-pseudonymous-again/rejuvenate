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
		edit: (pkgjson) => {
			const babel = pkgjson.babel;
			babel.presets = replaceOrInsert(babel.presets, presetCurrentNode);
			babel.plugins = replaceOrInsert(babel.plugins, pluginRemoveDebug);
			const env = babel.env;
			env.debug.presets = remove(env.debug.presets, presetEnv);
			if (env.debug.presets.length === 0) delete env.debug.presets;
			env.debug.plugins = replaceOrInsert(env.debug.plugins, pluginKeepDebug);
			env.test.presets = remove(env.test.presets, presetEnv);
			if (env.test.presets.length === 0) delete env.test.presets;
			env.test.plugins = remove(env.test.plugins, transformRemoveConsole);
			if (env.test.plugins.length === 0) delete env.test.plugins;
			env.cover.presets = remove(env.cover.presets, presetEnv);
			if (env.cover.presets.length === 0) delete env.cover.presets;
			env.cover.plugins = remove(env.cover.plugins, transformRemoveConsole);
			if (env.cover.plugins.length === 0) delete env.cover.plugins;
			env.development.presets = replaceOrInsert(
				env.development.presets,
				presetDefaults,
			);
			env.development.plugins = remove(
				env.development.plugins,
				transformRemoveConsole,
			);
			if (env.development.plugins.length === 0) delete env.development.plugins;
			env.production.presets = replaceOrInsert(
				env.production.presets,
				presetDefaults,
			);
			if (env.production.presets.length === 0) delete env.production.presets;
			env.production.plugins = remove(
				env.production.plugins,
				transformRemoveConsole,
			);
			if (env.production.plugins.length === 0) delete env.production.plugins;
			return format(pkgjson);
		},
	});
	await fixConfig();
}

export const dependencies = [
	'babel:setup-presets',
	'babel:setup-sourcemaps',
	'babel:setup-env-cover',
	'babel:setup-env-debug',
	'babel:setup-env-development',
	'babel:setup-env-production',
	'babel:setup-env-test',
];
