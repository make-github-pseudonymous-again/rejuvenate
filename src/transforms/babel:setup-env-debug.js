import update from '../lib/update.js';
import {
	includes,
	replaceOrInsert,
	presetCurrentNode,
	presetPowerAssert,
	format,
} from '../lib/babel.js';

export const description = 'Setup debug environment.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel?.env?.debug;
	assert(env !== undefined);
	assert(env.presets !== undefined);
	assert(includes(env.presets, presetCurrentNode));
	assert(env.presets.includes(presetPowerAssert));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const env = pkgjson.babel?.env?.debug;
	assert(
		!includes(env?.presets, presetCurrentNode) ||
			!env?.presets?.includes(presetPowerAssert),
	);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			const env = pkgjson.babel.env.debug;
			env.presets = replaceOrInsert(env.presets, presetCurrentNode);
			env.presets = replaceOrInsert(env.presets, presetPowerAssert);
			return format(pkgjson);
		},
	});
	await fixConfig();
}

export const dependencies = [
	'config:lint-setup',
	'babel:setup-presets',
	'deps:add-babel-preset-power-assert',
	'package.json:ensure-babel-env-debug',
];
