import update from '../lib/update.js';

export const description =
	'Configure workflow to automate detection of sources lint.';

export const commit = {
	type: 'config',
	scope: 'ci',
	subject: description,
};

const newLintWorkflowPath = '.github/workflows/ci:lint.yml';

const newLintWorkflowDefinition = `
name: ci:lint
on:
  - push
  - pull_request
jobs:
  cover:
    name: Continuous integration (code linting)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install 📦
        uses: bahmutov/npm-install@v1
        with:
          install-command: yarn --frozen-lockfile --ignore-scripts
          useRollingCache: true

      - name: Lint 👕
        run: yarn lint
`;

export async function postcondition({assert, exists}) {
	assert(await exists(newLintWorkflowPath));
}

export async function precondition({assert, exists}) {
	assert(!(await exists(newLintWorkflowPath)));
}

export async function apply({read, write}) {
	await update({
		create: true,
		overwrite: false,
		read: () => read(newLintWorkflowPath),
		write: (data) => write(newLintWorkflowPath, data),
		edit: () => newLintWorkflowDefinition.trim() + '\n',
	});
}

export const dependencies = [
	'ava:setup-v4',
	'ava:use-node-loader-babel',
	'github:workflow-configure-ci:test',
	'github:workflow-configure-ci:build',
];
