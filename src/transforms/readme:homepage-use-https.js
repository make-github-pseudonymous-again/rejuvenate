import replace from '../lib/replace.js';
import count from '../lib/count.js';

export const description = 'Use https for homepage URL.';

export const commit = {
	type: 'docs',
	scope: 'README.md',
	subject: description,
};

const filename = 'README.md';

export async function postcondition({read, readPkg, assert}) {
	const homepage = (await readPkg()).homepage;
	const domain = homepage.replace(/^https:\/\//, '');
	const homepageCount = await count([homepage], [filename], {
		read,
		method: count.exact,
	});
	const domainCount = await count([domain], [filename], {
		read,
		method: count.exact,
	});
	assert(domainCount === homepageCount);
}

export async function precondition({read, readPkg, assert}) {
	const homepage = (await readPkg()).homepage;
	const domain = homepage.replace(/^https:\/\//, '');
	const homepageCount = await count([homepage], [filename], {
		read,
		method: count.exact,
	});
	const domainCount = await count([domain], [filename], {
		read,
		method: count.exact,
	});
	assert(domainCount !== homepageCount);
}

export async function apply({read, write, readPkg}) {
	const homepage = (await readPkg()).homepage;
	const httpURL = homepage.replace(/^https:\/\//, 'http://');
	const operations = [[httpURL, () => homepage]];
	await replace(operations, [filename], {read, write, method: replace.all});
}

export const dependencies = ['package.json:homepage-fix'];
