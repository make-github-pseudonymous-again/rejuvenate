import update from '../lib/update.js';
import {includes, replaceOrInsert} from '../lib/babel.js';

export const description = 'Setup test environment.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

const presetEnv = '@babel/preset-env';
const presetPowerAssert = 'babel-preset-power-assert';
const presetCurrentNode = [presetEnv, {targets: 'current node'}];

const pluginRemoveDebug = [
	'transform-remove-console',
	{
		exclude: ['log', 'error', 'warn'],
	},
];

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel?.env?.test;
	assert(env !== undefined);
	assert(env.presets !== undefined);
	assert(env.plugins !== undefined);
	assert(includes(env.presets, presetCurrentNode));
	assert(includes(env.presets, presetPowerAssert));
	assert(includes(env.plugins, pluginRemoveDebug));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel?.env?.test;
	assert(
		!includes(env?.presets, presetCurrentNode) ||
			!includes(env?.presets, presetPowerAssert) ||
			!includes(env?.plugins, pluginRemoveDebug),
	);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			const env = pkgjson.babel.env.test;
			env.presets = replaceOrInsert(env.presets, presetCurrentNode);
			env.presets = replaceOrInsert(env.presets, presetPowerAssert);
			env.plugins = replaceOrInsert(env.plugins, pluginRemoveDebug);
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = [
	'config:lint-setup',
	'babel:setup-presets',
	'deps:add-babel-preset-power-assert',
	'deps:add-babel-plugin-transform-remove-console',
	'package.json:ensure-babel-env-test',
];
