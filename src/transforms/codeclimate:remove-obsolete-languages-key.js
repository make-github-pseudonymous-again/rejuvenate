import update from '../lib/update.js';

export const description = 'Remove obsolete languages key.';

export const commit = {
	type: 'config',
	scope: 'codeclimate',
	subject: description,
};

const configFile = '.codeclimate.yml';

export async function postcondition({readYAML, assert}) {
	const config = await readYAML(configFile);
	assert(config.languages === undefined);
}

export async function precondition({readYAML, assert}) {
	const config = await readYAML(configFile);
	assert(config.languages !== undefined);
}

export async function apply({readYAML, writeYAML}) {
	await update({
		read: () => readYAML(configFile),
		write: (data) => writeYAML(configFile, data),
		edit: (config) => {
			delete config.languages;
			return config;
		},
	});
}

export const dependencies = ['codeclimate:format-config-file'];
