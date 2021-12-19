import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description =
	'Replace david-dm dependencies badge by libraries.io.';

export const commit = {
	type: 'docs',
	scope: 'README.md',
	subject: description,
};

const filename = 'README.md';
const needle = (
	repository,
) => `[![Dependencies](https://img.shields.io/david/${repository}.svg)](https://david-dm.org/${repository})
[![Dev dependencies](https://img.shields.io/david/dev/${repository}.svg)](https://david-dm.org/${repository}?type=dev)`;
const replacement = (repository) =>
	`[![Dependencies](https://img.shields.io/librariesio/github/${repository}.svg)](https://github.com/${repository}/network/dependencies)`;

const slug = ({url}) => url.match(/\/([^/]+\/[^/]+)$/)[1];

export async function postcondition({readPkg, read, assert}) {
	const {repository} = await readPkg();
	const repo = slug(repository);
	const found = await find([needle(repo)], [filename], {
		read,
		method: find.exact,
	});
	assert(!found);
}

export async function precondition({readPkg, read, assert}) {
	const {repository} = await readPkg();
	const repo = slug(repository);
	const found = await find([needle(repo)], [filename], {
		read,
		method: find.exact,
	});
	assert(found);
}

export async function apply({readPkg, read, write}) {
	const {repository} = await readPkg();
	const repo = slug(repository);
	const operations = [[needle(repo), () => replacement(repo)]];
	await replace(operations, [filename], {read, write, method: replace.all});
}
