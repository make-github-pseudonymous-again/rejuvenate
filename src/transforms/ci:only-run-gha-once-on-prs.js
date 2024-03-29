import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description = 'Only run GHA workflows once on PRs.';

export const commit = {
	type: 'config',
	scope: 'ci',
	subject: description,
};

const workflowFiles = [
	'.github/workflows/ci.yml',
	'.github/workflows/ci:cover.yml',
	'.github/workflows/ci:lint-config.yml',
	'.github/workflows/ci:lint.yml',
];

const oldWorkflowLines = `on:
  - push
  - pull_request
`;

const newWorkflowLines = `on:
  push:
    branches:
      main
  pull_request:
`;

export async function postcondition({assert, exists, read}) {
	for (const workflowFile of workflowFiles) {
		// eslint-disable-next-line no-await-in-loop
		assert(await exists(workflowFile));
		assert(
			// eslint-disable-next-line no-await-in-loop
			await find([newWorkflowLines], [workflowFile], {
				read,
				method: find.exact,
			}),
		);
	}

	for (const workflowFile of workflowFiles) {
		// eslint-disable-next-line no-await-in-loop
		assert(await exists(workflowFile));
		assert(
			// eslint-disable-next-line no-await-in-loop
			!(await find([oldWorkflowLines], [workflowFile], {
				read,
				method: find.exact,
			})),
		);
	}
}

export async function precondition({assert, exists, read}) {
	for (const workflowFile of workflowFiles) {
		// eslint-disable-next-line no-await-in-loop
		assert(await exists(workflowFile));
		assert(
			// eslint-disable-next-line no-await-in-loop
			await find([oldWorkflowLines], [workflowFile], {
				read,
				method: find.exact,
			}),
		);
	}

	for (const workflowFile of workflowFiles) {
		// eslint-disable-next-line no-await-in-loop
		assert(await exists(workflowFile));
		assert(
			// eslint-disable-next-line no-await-in-loop
			!(await find([newWorkflowLines], [workflowFile], {
				read,
				method: find.exact,
			})),
		);
	}
}

export async function apply({read, write}) {
	await replace([[oldWorkflowLines, newWorkflowLines]], workflowFiles, {
		read,
		write,
		method: replace.all,
	});
}

export const dependencies = [
	'ci:test-build',
	'github:workflow-configure-ci:cover',
	'github:workflow-configure-ci:lint',
	'github:workflow-configure-ci:lint-config',
];
