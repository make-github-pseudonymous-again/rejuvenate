import update from '../lib/update.js';
import stringify from '../lib/yaml/stringify.js';
import parse from '../lib/yaml/parse.js';

const filename = '.codeclimate.yml';
export const description = `Format ${filename}.`;

export const commit = {
	subject: description,
};

const format = (text) => stringify(parse(text));

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
