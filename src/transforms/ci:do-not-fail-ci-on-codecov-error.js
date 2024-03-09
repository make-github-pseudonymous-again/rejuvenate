import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description = 'Do not fail coverage workflow on codecov error.';

export const commit = {
	type: 'config',
	scope: 'ci',
	subject: description,
};

const workflowFiles = ['.github/workflows/ci:cover.yml'];

const oldWorkflowLines = `
        with:
          fail_ci_if_error: true
`;
const newWorkflowLines = `
        continue-on-error: true
        with:
          fail_ci_if_error: true
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

export const dependencies = ['github:workflow-configure-ci:cover'];
