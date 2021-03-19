import replace from '../lib/lines/replace.js';
import find from '../lib/lines/find.js';

const filename = '.gitignore';
const directory = '.nyc_output';
const pattern = /^\.nyc_output/;
export const description = `Add leading slash to ignored ${directory} directory.`;

export const commit = {
	scope: filename,
	subject: description,
};

export async function postcondition({lines, assert}) {
	const found = await find([pattern], [filename], {lines, method: find.regexp});
	assert(!found);
}

export async function precondition({lines, assert}) {
	const found = await find([pattern], [filename], {lines, method: find.regexp});
	assert(found);
}

export async function apply({lines, write}) {
	await replace([[pattern, '/' + directory]], [filename], {
		lines,
		write,
		method: replace.first,
	});
}
