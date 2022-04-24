import update from '../lib/update.js';
import replace from '../lib/text/replace.js';

export const description = 'Define custom script to run on travis.';

export const commit = {
	subject: description,
};

const configFile = '.travis.yml';
const oldScript = 'npm run cover';
const newScript = 'npm run travis';
const newScriptDefinition =
	'npm run lint-config && npm run lint && npm run cover';

export async function postcondition({readPkg, exists, readYAML, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.scripts.travis !== undefined);
	assert(await exists(configFile));
	const config = await readYAML(configFile);
	assert(!config.script.includes(oldScript));
	assert(config.script.includes(newScript));
}

export async function precondition({readPkg, exists, readYAML, assert}) {
	const pkgjson = await readPkg();
	assert(pkgjson.scripts.travis === undefined);
	assert(await exists(configFile));
	const config = await readYAML(configFile);
	assert(config.script.includes(oldScript));
	assert(!config.script.includes(newScript));
}

export async function apply({readPkg, writePkg, read, write, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.scripts.travis = newScriptDefinition;
			return pkgjson;
		},
	});

	const operations = [[oldScript, () => newScript]];
	await replace(operations, [configFile], {
		read,
		write,
		method: replace.all,
	});

	await fixConfig();
}

export const dependencies = ['config:lint-setup', 'sources:lint-setup'];
