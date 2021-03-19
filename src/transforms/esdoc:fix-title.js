import {filter, map, next} from '@aureooms/js-itertools';
import update from '../lib/update.js';

const filename = '.esdoc.json';
export const description = 'Fix title.';

export const commit = {
	scope: filename,
	subject: description,
};

export async function postcondition({readPkg, readJSON, assert}) {
	const {name} = await readPkg();
	const {plugins} = await readJSON(filename);
	const title = next(
		map(
			(plugin) => plugin.option.brand.title,
			filter((plugin) => plugin.name === 'esdoc-standard-plugin', plugins),
		),
	);
	assert(title === name);
}

export async function precondition({readPkg, readJSON, assert}) {
	const {name} = await readPkg();
	const {plugins} = await readJSON(filename);
	const title = next(
		map(
			(plugin) => plugin.option.brand.title,
			filter((plugin) => plugin.name === 'esdoc-standard-plugin', plugins),
		),
	);
	assert(title !== name);
}

export async function apply({readPkg, readJSON, writeJSON}) {
	const {name} = await readPkg();
	await update({
		read: () => readJSON(filename),
		write: (config) => writeJSON(filename, config),
		edit: (config) => {
			const brand = next(
				map(
					(plugin) => plugin.option.brand,
					filter(
						(plugin) => plugin.name === 'esdoc-standard-plugin',
						config.plugins,
					),
				),
			);
			brand.title = name;
			return config;
		},
	});
}

export const dependencies = ['esdoc:format-config-file'];
