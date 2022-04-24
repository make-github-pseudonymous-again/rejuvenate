import update from '../lib/update.js';

export const description = 'Rename exclude_paths to exclude_patterns.';

export const commit = {
	type: 'config',
	scope: 'codeclimate',
	subject: description,
};

const configFile = '.codeclimate.yml';

export async function postcondition({readYAML, assert}) {
	const config = await readYAML(configFile);
	assert(config.exclude_paths === undefined);
}

export async function precondition({readYAML, assert}) {
	const config = await readYAML(configFile);
	assert(config.exclude_paths !== undefined);
	assert(config.exclude_patterns === undefined);
}

export async function apply({readYAML, writeYAML}) {
	await update({
		read: () => readYAML(configFile),
		write: (data) => writeYAML(configFile, data),
		edit(config) {
			// eslint-disable-next-line camelcase
			config.exclude_patterns = config.exclude_paths;
			delete config.exclude_paths;
			return config;
		},
	});
}

export const dependencies = ['codeclimate:format-config-file'];
