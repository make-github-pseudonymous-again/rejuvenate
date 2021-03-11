import assert from 'assert';
import Listr from 'listr';

import parse from './parse.js';
import {fetchTransforms, transformToTask} from './transforms.js';
import chcwd from './util/chcwd.js';
import logger from './util/logger.js';

/**
 * Main.
 *
 * @param {Array} argv
 */
export default function main(argv) {
	const {command, options, isDefault} = parse(argv.slice(2));

	const globals = {
		assert,
		...chcwd(options),
		...logger(options),
	};

	globals.debug({command, options});

	const {git} = globals;

	const tasks = new Listr(
		[
			{
				title: 'Retrieving git status',
				task: (ctx) =>
					git.status().then((status) => {
						ctx.status = status;
					}),
			},
			{
				title: 'Checking that repo is clean',
				task: (ctx) => checkStatus(ctx.status, options, globals),
			},
			{
				title: 'Pulling from remote',
				enabled: () => options.pull,
				task: () => git.pull(),
			},
			{
				title: 'Setup temporary branch',
				task: async () => {
					const localBranches = await git.branchLocal();
					return new Listr([
						{
							title: 'Delete existing local branch',
							enabled: () => localBranches.all.includes(options.branch),
							task: () => git.deleteLocalBranch(options.branch, true),
						},
						{
							title: 'Checking out local branch',
							task: () => git.checkoutLocalBranch(options.branch),
						},
					]);
				},
			},
			{
				title: 'Computing the transform dependency graph',
				task: async (ctx) => {
					ctx.transforms = [];
					for await (const transform of fetchTransforms(
						options.transformDir,
						options.transforms,
					)) {
						ctx.transforms.push(transform);
					}
				},
			},
			{
				title: 'Applying the transforms one by one',
				task: (ctx) =>
					new Listr(ctx.transforms.map((t) => transformToTask(t, globals))),
			},
			{
				title: 'Checking out current branch',
				task: (ctx) => git.checkout(ctx.status.current),
			},
			{
				title: 'Rebasing current branch on temporary branch',
				enabled: () => options.rebase,
				task: () => git.rebase([options.branch]),
			},
			{
				title: 'Pushing current branch to remote',
				enabled: () => options.rebase && options.push,
				task: () => git.push(),
			},
			{
				title: 'Pushing temporary branch to remote',
				enabled: () => options.keep && !isDefault('branch') && options.push,
				task: async (ctx) => {
					await git.checkout(options.branch);
					await git.push(options.remote, options.branch, ['--force']);
					await git.checkout(ctx.status.current);
				},
			},
			{
				title: 'Deleting temporary branch',
				enabled: () => !options.keep,
				task: () => git.deleteLocalBranch(options.branch, true),
			},
		],
		{collapse: false},
	);

	return tasks.run();
}

/**
 * CheckStatus.
 *
 * @param {any} status
 * @param {Object} options
 * @param {Object} globals
 */
function checkStatus(status, options, globals) {
	globals.debug({status});
	const {tracking, current, behind} = status;
	if (!current) throw new Error('No current branch');
	if (!tracking) throw new Error('Not tracking any remote branch');
	const [, remote, remoteBranch] = tracking.match('(.*)/(.*)');
	if (remote !== options.remote)
		throw new Error(
			`The remote of the tracked branch does not correspond to the remote specified through options (${remote} ~ ${options.remote})`,
		);
	if (current !== remoteBranch)
		throw new Error(
			`Current branch does not correspond to tracking branch (${current} ~ ${tracking})`,
		);
	if (behind !== 0)
		throw new Error(`Current branch is behind (${behind}) tracked branch`);

	const changes = [
		'not_added',
		'conflicted',
		'created',
		'deleted',
		'modified',
		'renamed',
		'files',
		'staged',
	];

	for (const change of changes) {
		if (status[change]?.length) throw new Error(`Not clean (${change})`);
	}
}
