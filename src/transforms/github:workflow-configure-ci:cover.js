import update from '../lib/update.js';
import find from '../lib/text/find.js';
import replace from '../lib/text/replace.js';

export const description =
	'Configure workflow to automate tests of changes (with coverage).';

export const commit = {
	type: 'config',
	scope: 'ci',
	subject: description,
};

const readme = 'README.md';
const oldBadge = (repository, branch = 'main') =>
	`[![Tests](https://img.shields.io/github/workflow/status/${repository}/ci:test?event=push&label=tests)](https://github.com/${repository}/actions/workflows/ci:test.yml?query=branch:${branch})`;
const newBadge = (repository, branch = 'main') =>
	`[![Tests](https://img.shields.io/github/workflow/status/${repository}/ci:cover?event=push&label=tests)](https://github.com/${repository}/actions/workflows/ci:cover.yml?query=branch:${branch})`;

const slug = ({url}) => url.match(/\/([^/]+\/[^/]+)$/)[1];

const oldTestWorkflowPath = '.github/workflows/ci:test.yml';
const newCoverWorkflowPath = '.github/workflows/ci:cover.yml';

const newCoverWorkflowDefinition = `
name: ci:cover
on:
  - push
  - pull_request
jobs:
  cover:
    name: Continuous integration (code coverage)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install 📦
        uses: bahmutov/npm-install@v1
        with:
          install-command: yarn --frozen-lockfile --ignore-scripts
          useRollingCache: true

      - name: Test and record coverage 🔬
        run: yarn cover

      - name: Publish coverage report 📃
        uses: codecov/codecov-action@v3
        with:
          fail_ci_if_error: true
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
	assert(!(await exists(oldTestWorkflowPath)));
	debug('old test workflow is gone');
	assert(await exists(newCoverWorkflowPath));
	debug('new cover workflow is there');
}

export async function precondition({readPkg, assert, exists, read}) {
	const {ava, scripts, repository} = await readPkg();
	assert(ava !== undefined);
	assert(scripts?.test === 'ava');
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
	assert(await exists(oldTestWorkflowPath));
	assert(!(await exists(newCoverWorkflowPath)));
}

export async function apply({read, write, remove, readPkg}) {
	await update({
		create: true,
		overwrite: false,
		read: () => read(newCoverWorkflowPath),
		write: (data) => write(newCoverWorkflowPath, data),
		edit: () => newCoverWorkflowDefinition.trim() + '\n',
	});

	const {repository} = await readPkg();
	const repo = slug(repository);
	const operations = [[oldBadge(repo), () => newBadge(repo)]];
	await replace(operations, [readme], {read, write, method: replace.all});
	await remove([oldTestWorkflowPath]);
}

export const dependencies = [
	'ava:setup-v4',
	'ava:use-node-loader-babel',
	'github:workflow-configure-ci:test',
	'github:workflow-configure-ci:build',
];
