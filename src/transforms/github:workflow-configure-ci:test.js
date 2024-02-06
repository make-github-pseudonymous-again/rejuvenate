import update from '../lib/update.js';
import contains from '../lib/contains.js';
import parseYAML from '../lib/yaml/parse.js';
import find from '../lib/lines/find.js';
import replace from '../lib/lines/replace.js';

export const description = 'Configure workflow to automate tests of changes.';

const oldScript = 'travis';
const oldFilename = '.travis.yml';
const newScript = 'ci:test';
const newFilename = `.github/workflows/${newScript}.yml`;
const README = 'README.md';

const oldBadge = (repository, branch = 'main') =>
	`[![Build](https://img.shields.io/travis/${repository}/${branch}.svg)](https://travis-ci.com/${repository}/branches)`;
const newBadge = (repository, branch = 'main') =>
	`[![Tests](https://img.shields.io/github/workflow/status/${repository}/${newScript}?event=push&label=tests)](https://github.com/${repository}/actions/workflows/${newScript}.yml?query=branch:${branch})`;

export const commit = {
	type: 'config',
	scope: 'github',
	subject: description,
};

const slug = ({url}) => url.match(/\/([^/]+\/[^/]+)$/)[1];

export async function postcondition({
	readPkg,
	exists,
	lines,
	readYAML,
	assert,
}) {
	const {scripts, repository} = await readPkg();
	const repo = slug(repository);
	assert(scripts[oldScript] === undefined);
	assert(scripts[newScript] !== undefined);
	assert(!(await exists(oldFilename)));
	await contains({
		assert,
		read: () => readYAML(newFilename),
		test: (contents) => assert.deepStrictEqual(contents, parseYAML(newConfig)),
	});
	const oldFound = await find([oldBadge(repo)], [README], {
		lines,
		method: find.exact,
	});
	assert(!oldFound);
	const newFound = await find([newBadge(repo)], [README], {
		lines,
		method: find.exact,
	});
	assert(newFound);
}

export async function precondition({readPkg, exists, lines, assert}) {
	const {scripts, repository} = await readPkg();
	const repo = slug(repository);
	assert(scripts[oldScript] !== undefined);
	assert(scripts[newScript] === undefined);
	assert(await exists(oldFilename));
	assert(!(await exists(newFilename)));
	const oldFound = await find([oldBadge(repo)], [README], {
		lines,
		method: find.exact,
	});
	assert(oldFound);
	const newFound = await find([newBadge(repo)], [README], {
		lines,
		method: find.exact,
	});
	assert(!newFound);
}

export async function apply({
	readPkg,
	writePkg,
	read,
	lines,
	write,
	remove,
	fixConfig,
}) {
	const {repository} = await readPkg();
	const repo = slug(repository);
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkgjson.scripts[newScript] = pkgjson.scripts[oldScript];
			delete pkgjson.scripts[oldScript];
			return pkgjson;
		},
	});
	await update({
		create: true,
		overwrite: false,
		read: () => read(newFilename),
		write: (data) => write(newFilename, data),
		edit: () => newConfig.trim() + '\n',
	});
	await replace([[oldBadge(repo), newBadge(repo)]], [README], {
		lines,
		write,
		method: replace.whole,
	});
	await remove([oldFilename]);
	await fixConfig();
}

const newConfig = `
name: ${newScript}
on:
  - push
  - pull_request
jobs:
  test:
    name: Continuous integration (tests)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install 🔧
        uses: bahmutov/npm-install@v1
        with:
          install-command: yarn --frozen-lockfile --ignore-scripts
          useRollingCache: true

      - name: Test 🔬
        run: yarn ${newScript}

      - name: Publish coverage report 📃
        uses: codecov/codecov-action@v3
        with:
          fail_ci_if_error: true
`;

export const dependencies = ['ci:travis-setup'];
