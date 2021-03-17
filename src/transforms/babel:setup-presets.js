import update from '../lib/update.js';
import {includes, replaceOrInsert} from '../lib/babel.js';

export const description = 'Setup default presets.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

const presetEnv = '@babel/preset-env';
const presetDefaults = [
	presetEnv,
	{targets: ['defaults', 'maintained node versions']},
];

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
	assert(!includes(env?.presets, presetDefaults));
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			const env = pkgjson.babel;
			env.presets = replaceOrInsert(env.presets, presetDefaults);
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = [
	'config:lint-setup',
	'package.json:ensure-babel',
	'deps:add-@babel-preset-env',
];
