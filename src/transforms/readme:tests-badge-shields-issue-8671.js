import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description = 'Fix https://github.com/badges/shields/issues/8671.';

export const commit = {
	type: 'docs',
	scope: 'README.md',
	subject: description,
};

const filename = 'README.md';
const needle = (repository) =>
	`[![Tests](https://img.shields.io/github/workflow/status/${repository}/ci?event=push&label=tests)](https://github.com/${repository}/actions/workflows/ci:test.yml?query=branch:main)`;
const replacement = (repository) =>
	`[![Tests](https://img.shields.io/github/actions/workflow/status/${repository}/ci.yml?branch=main&event=push&label=tests)](https://github.com/${repository}/actions/workflows/ci:test.yml?query=branch:main)`;

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

export const dependencies = ['ava:test-build'];
