import update from '../lib/update.js';

export const description =
	'Configure workflow to automate detection of config lint.';

export const commit = {
	type: 'config',
	scope: 'ci',
	subject: description,
};

const newLintConfigWorkflowPath = '.github/workflows/ci:lint-config.yml';

const newLintConfigWorkflowDefinition = `
name: ci:lint-config
on:
  - push
  - pull_request
jobs:
  cover:
    name: Continuous integration (config linting)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install 📦
        uses: bahmutov/npm-install@v1
        with:
          install-command: yarn --frozen-lockfile --ignore-scripts
          useRollingCache: true

      - name: Lint config 👕
        run: yarn lint-config
`;

export async function postcondition({assert, exists}) {
	assert(await exists(newLintConfigWorkflowPath));
}

export async function precondition({assert, exists}) {
	assert(!(await exists(newLintConfigWorkflowPath)));
}

export async function apply({read, write}) {
	await update({
		create: true,
		overwrite: false,
		read: () => read(newLintConfigWorkflowPath),
		write: (data) => write(newLintConfigWorkflowPath, data),
		edit: () => newLintConfigWorkflowDefinition.trim() + '\n',
	});
}

export const dependencies = [
	'ava:setup-v4',
	'ava:use-node-loader-babel',
	'github:workflow-configure-ci:test',
	'github:workflow-configure-ci:build',
];
