import find from '../lib/text/find.js';
import update from '../lib/update.js';

export const description = 'Ensure that heading is present';

export const commit = {
	type: 'docs',
	scope: 'manual/example',
	subject: description,
};

const filename = 'doc/manual/example.md';
const heading = '# Examples';

export async function postcondition({read, assert}) {
	const found = await find([/^# /], [filename], {read, method: find.regexp});
	assert(found);
}

export async function precondition({read, assert}) {
	const found = await find([/^# /], [filename], {read, method: find.regexp});
	assert(!found);
}

export async function apply({read, write}) {
	await update({
		read: () => read(filename),
		write: (data) => write(filename, data),
		edit: (contents) => heading + '\n' + contents,
	});
}
