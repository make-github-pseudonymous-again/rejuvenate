import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description = 'Remove trailing slash in homepage URL.';

export const commit = {
	type: 'docs',
	scope: 'README.md',
	subject: description,
};

const filename = 'README.md';

export async function postcondition({read, readPkg, assert}) {
	const homepage = (await readPkg()).homepage;
	const domain = homepage.replace(/^https:\/\//, '/');
	const found = await find([domain + '//'], [filename], {
		read,
		method: find.exact,
	});
	assert(!found);
}

export async function precondition({read, readPkg, assert}) {
	const homepage = (await readPkg()).homepage;
	const domain = homepage.replace(/^https:\/\//, '/');
	const found = await find([domain + '//'], [filename], {
		read,
		method: find.exact,
	});
	assert(found);
}

export async function apply({read, write, readPkg}) {
	const homepage = (await readPkg()).homepage;
	const domain = homepage.replace(/^https:\/\//, '/');
	const operations = [[domain + '//', () => domain + '/']];
	await replace(operations, [filename], {read, write, method: replace.all});
}

export const dependencies = ['package.json:homepage-fix'];
