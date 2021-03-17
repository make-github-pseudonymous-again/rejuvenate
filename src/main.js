import assert from 'assert';
import _commandExists from 'command-exists';
import Listr from 'listr';
import renderer from './ui/renderer.js';

import parse from './parse.js';
import {fetchTransforms, transformToTask} from './transforms.js';
import chcwd from './util/chcwd.js';
import logger from './util/logger.js';

async function ensureCommandExists(exe) {
	try {
		await _commandExists(exe);
	} catch {
		// NB: _error is null
		// See:
		//   - https://github.com/mathisonian/command-exists/issues/22#issuecomment-473941461
		//   - https://github.com/mathisonian/command-exists/blob/742a73d75e6ff737c35aa7c88d0828cbb0455811/lib/command-exists.js#L32
		//   - https://github.com/mathisonian/command-exists/blob/742a73d75e6ff737c35aa7c88d0828cbb0455811/lib/command-exists.js#L54
		throw new Error(`Command \`${exe}\` does not exist.`);
	}
}

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

	const listrOptions =
		options.loglevel > globals.DEBUG
			? {renderer: 'verbose'}
			: {
					renderer,
					collapse: (level) => globals.INFO + level > options.loglevel,
					maxSubtasks: (level) =>
						globals.INFO + level <= options.loglevel
							? Number.POSITIVE_INFINITY
							: globals.WARN + level <= options.loglevel
							? options.maxSubtasks
							: 0,
			  };

	let requiredExecutables = ['git', 'npm', 'yarn'];
	if (!options.install) {
		requiredExecutables = [
			...requiredExecutables,
			'xo',
			'fixpack',
			'babel',
			'microbundle',
		];
	}

	const tasks = new Listr(
		[
			{
				title: 'Checking for required executables',
				task: () =>
					new Listr(
						requiredExecutables.map((exe) => ({
							title: exe,
							task: () => ensureCommandExists(exe),
						})),
						{concurrent: true},
					),
			},
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
				title: 'Computing the dependency graph',
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
				title: 'Applying transforms',
				task: (ctx) =>
					new Listr(
						ctx.transforms.map((t) => transformToTask(t, options, globals)),
					),
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
		listrOptions,
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

	// TODO could use status.isClean() instead.
	for (const change of changes) {
		if (status[change]?.length) throw new Error(`Not clean (${change})`);
	}
}
