import update from '../lib/update.js';
import * as pkg from '../lib/pkg.js';

export const description = 'Setup environments.';

export const commit = {
	type: 'config',
	scope: 'babel',
	subject: description,
};

const deps = [
	'babel-plugin-transform-remove-console',
	'babel-plugin-unassert',
	'babel-preset-power-assert',
	'power-assert',
];

const removeDebug = [
	'transform-remove-console',
	{
		exclude: ['log', 'error', 'warn'],
	},
];

const presetEnv = '@babel/preset-env';
const presetCurrentNode = [presetEnv, {targets: 'current node'}];

const pluginUnassert = 'babel-plugin-unassert';

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	for (const dep of deps) assert(devDeps.has(dep));
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	for (const dep of deps) assert(!devDeps.has(dep));
}

export async function apply({readPkg, writePkg, upgrade, fixConfig, install}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit: (pkgjson) => {
			for (const dep of deps) pkg.addDevDep(pkgjson, dep);
			const babel = pkgjson.babel;
			babel.sourceMaps = true;
			babel.presets = babel.presets.map((preset) => {
				if (preset !== '@babel/preset-env') return preset;
				return [preset, {targets: ['defaults', 'maintained node versions']}];
			});
			const env = babel.env;
			delete env.debug.sourceMaps;
			delete env.test.sourceMaps;
			delete env.development.sourceMaps;
			delete env.production.sourceMaps;

			// DEBUG
			if (env.debug.presets === undefined) {
				env.debug.presets = [presetCurrentNode];
			} else {
				env.debug.presets = env.debug.presets.map((preset) => {
					if (preset !== presetEnv) return preset;
					return presetCurrentNode;
				});
			}

			if (!env.debug.presets.includes('babel-preset-power-assert')) {
				env.debug.presets.push('babel-preset-power-assert');
			}

			// TEST
			if (env.test.presets === undefined) {
				env.test.presets = [presetCurrentNode];
			} else {
				env.test.presets = env.test.presets.map((preset) => {
					if (preset !== presetEnv) return preset;
					return presetCurrentNode;
				});
			}

			if (!env.test.presets.includes('babel-preset-power-assert')) {
				env.test.presets.push('babel-preset-power-assert');
			}

			if (env.test.plugins === undefined) {
				env.test.plugins = [];
			}

			if (!env.test.plugins.includes(removeDebug)) {
				env.test.plugins.push(removeDebug);
			}

			// DEVELOPMENT
			if (env.development.presets === undefined) {
				env.development.presets = [];
			}

			if (!env.development.presets.includes('babel-preset-power-assert')) {
				env.development.presets.push('babel-preset-power-assert');
			}

			if (env.development.plugins === undefined) {
				env.development.plugins = [];
			}

			if (!env.development.plugins.includes(removeDebug)) {
				env.development.plugins.push(removeDebug);
			}

			// PRODUCTION
			if (env.production.plugins === undefined) {
				env.production.plugins = [];
			}

			if (!env.production.plugins.includes(pluginUnassert)) {
				env.production.plugins.push(pluginUnassert);
			}

			if (!env.production.plugins.includes(removeDebug)) {
				env.production.plugins.push(removeDebug);
			}

			// SORT BABEL.ENV KEYS
			babel.env = {
				debug: env.debug,
				test: env.test,
				development: env.development,
				production: env.production,
				...env,
			};

			// SORT BABEL KEYS
			pkgjson.babel = {
				sourceMaps: true,
				...babel,
			};

			return pkgjson;
		},
	});
	await upgrade(deps.join(' '));
	await fixConfig();
	await install();
}

export const dependencies = [
	'package.json:ensure-babel-env-test',
	'package.json:ensure-babel-env-debug',
	'package.json:ensure-babel-env-development',
	'package.json:ensure-babel-env-production',
];
