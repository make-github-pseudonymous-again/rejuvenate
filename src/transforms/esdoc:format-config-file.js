import update from '../lib/update.js';

export const description = 'Format .esdoc.json.';

export const commit = {
	subject: description,
};

const filename = '.esdoc.json';
const format = (text) => JSON.stringify(JSON.parse(text), undefined, 2) + '\n';

export async function postcondition({read, assert}) {
	const text = await read(filename);
	assert(text === format(text));
}

export async function precondition({read, assert}) {
	const text = await read(filename);
	assert(text !== format(text));
}

export async function apply({read, write}) {
	await update({
		read: () => read(filename),
		write: (text) => write(filename, text),
		edit: (text) => format(text),
	});
}
