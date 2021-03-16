import update from '../lib/update.js';
import stringify from '../lib/json/stringify.js';
import parse from '../lib/json/parse.js';

const filename = '.esdoc.json';
export const description = `Format ${filename}.`;

export const commit = {
	subject: description,
};

const format = (text) => stringify(parse(text)) + '\n';

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
