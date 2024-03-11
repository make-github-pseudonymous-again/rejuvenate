import update from '../lib/update.js';
import find from '../lib/text/find.js';
import replace from '../lib/text/replace.js';

export const description = 'Test build.';

export const commit = {
	type: 'config',
	scope: 'ci',
	subject: description,
};

const readme = 'README.md';
const oldBadge = (repository, branch = 'main') =>
	`[![Tests](https://img.shields.io/github/workflow/status/${repository}/ci:cover?event=push&label=tests)](https://github.com/${repository}/actions/workflows/ci:cover.yml?query=branch:${branch})`;
const newBadge = (repository, branch = 'main') =>
	`[![Tests](https://img.shields.io/github/workflow/status/${repository}/ci?event=push&label=tests)](https://github.com/${repository}/actions/workflows/ci.yml?query=branch:${branch})`;

const slug = ({url}) => url.match(/\/([^/]+\/[^/]+)$/)[1];

const oldBuildWorkflowPath = '.github/workflows/ci:build.yml';
const newBuildWorkflowPath = '.github/workflows/ci.yml';
const newBuildWorkflowDefinition = `
name: ci

on:
  - push
  - pull_request

jobs:

  build:
    name: Continuous integration (build)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install 📦
        uses: bahmutov/npm-install@v1
        with:
          install-command: yarn --frozen-lockfile --ignore-scripts
          useRollingCache: true

      - name: Build 🏗️
        run: yarn build

      - name: Archive build 💽
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist
          retention-days: 1

  test:
    needs: ["build"]
    name: Continuous integration (tests)
    runs-on: ubuntu-latest
    strategy:
      matrix:
        bundle: ["modern", "module", "cjs"]
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install 📦
        uses: bahmutov/npm-install@v1
        with:
          install-command: yarn --frozen-lockfile --ignore-scripts
          useRollingCache: true

      - name: Load build 💽
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist

      - name: Test 🔬
        run: yarn test:\${{ matrix.bundle }}
`;

export async function postcondition({readPkg, assert, read, exists, debug}) {
	const {ava, repository} = await readPkg();
	assert(ava !== undefined);
	debug('ava is not undefined');
	const repo = slug(repository);
	assert(
		!(await find([oldBadge(repo)], [readme], {
			read,
			method: find.exact,
		})),
	);
	debug('old badge is not there');
	assert(
		await find([newBadge(repo)], [readme], {
			read,
			method: find.exact,
		}),
	);
	debug('new badge is there');
	assert(!(await exists(oldBuildWorkflowPath)));
	debug('old build workflow is gone');
	assert(await exists(newBuildWorkflowPath));
	debug('new build workflow is there');
}

export async function precondition({readPkg, assert, exists, read}) {
	const {ava, repository} = await readPkg();
	assert(ava !== undefined);
	const repo = slug(repository);
	assert(
		await find([oldBadge(repo)], [readme], {
			read,
			method: find.exact,
		}),
	);
	assert(
		!(await find([newBadge(repo)], [readme], {
			read,
			method: find.exact,
		})),
	);
	assert(await exists(oldBuildWorkflowPath));
	assert(!(await exists(newBuildWorkflowPath)));
}

export async function apply({read, write, remove, readPkg, writePkg}) {
	await update({
		create: true,
		overwrite: false,
		read: () => read(newBuildWorkflowPath),
		write: (data) => write(newBuildWorkflowPath, data),
		edit: () => newBuildWorkflowDefinition.trim() + '\n',
	});

	const {repository} = await readPkg();
	const repo = slug(repository);
	const operations = [[oldBadge(repo), () => newBadge(repo)]];
	await replace(operations, [readme], {read, write, method: replace.all});
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			const {scripts} = pkgjson;
			delete scripts['ci:build'];
			delete scripts['ci:test'];
			return pkgjson;
		},
	});
	await remove([oldBuildWorkflowPath]);
}

export const dependencies = [
	'github:workflow-configure-ci:build',
	'github:workflow-configure-ci:cover',
	'ava:test-build',
];
