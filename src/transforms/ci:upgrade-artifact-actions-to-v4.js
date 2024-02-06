import replace from '../lib/text/replace.js';
import find from '../lib/text/find.js';

export const description = 'Upgrade artifact actions to v4.';

export const commit = {
	type: 'config',
	scope: 'ci',
	subject: description,
};

const workflowFile = '.github/workflows/ci.yml';
const action = (name, version) => `uses: actions/${name}-artifact@${version}`;

export async function postcondition({read, assert}) {
	assert(
		await find([action('upload', 'v4')], [workflowFile], {
			read,
			method: find.exact,
		}),
	);
	assert(
		await find([action('download', 'v4')], [workflowFile], {
			read,
			method: find.exact,
		}),
	);
	assert(
		!(await find([action('upload', 'v3')], [workflowFile], {
			read,
			method: find.exact,
		})),
	);
	assert(
		!(await find([action('download', 'v3')], [workflowFile], {
			read,
			method: find.exact,
		})),
	);
}

export async function precondition({read, assert}) {
	assert(
		await find([action('upload', 'v3')], [workflowFile], {
			read,
			method: find.exact,
		}),
	);
	assert(
		await find([action('download', 'v3')], [workflowFile], {
			read,
			method: find.exact,
		}),
	);
	assert(
		!(await find([action('upload', 'v4')], [workflowFile], {
			read,
			method: find.exact,
		})),
	);
	assert(
		!(await find([action('download', 'v4')], [workflowFile], {
			read,
			method: find.exact,
		})),
	);
}

export async function apply({read, write}) {
	await replace(
		[
			[action('upload', 'v3'), () => action('upload', 'v4')],
			[action('download', 'v3'), () => action('download', 'v4')],
		],
		[workflowFile],
		{
			read,
			write,
			method: replace.all,
		},
	);
}

export const dependencies = ['ava:test-build'];
