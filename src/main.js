import assert from 'assert';
import parse from './parse.js';
import transforms from './transforms.js';
import exec from './exec.js';
import chcwd from './util/chcwd.js';
import logger from './util/logger.js';

/**
 * Main.
 *
 * @param {Array} argv
 */
export default async function main(argv) {
	const {command, options, isDefault} = parse(argv.slice(2));

	const globals = {
		assert,
		...chcwd(options),
		...logger(options),
	};

	globals.debug({command, options});

	const {git} = globals;

	const status = await git.status();
	checkStatus(status, options, globals);

	if (options.pull) {
		await git.pull();
	}

	const localBranches = await git.branchLocal();
	globals.debug({localBranches});
	if (localBranches.all.includes(options.branch)) {
		await git.deleteLocalBranch(options.branch, true);
	}

	await git.checkoutLocalBranch(options.branch);

	for await (const transform of transforms(
		options.transformDir,
		options.transforms,
	)) {
		await exec(transform, globals);
	}

	await git.checkout(status.current);
	if (options.rebase) {
		await git.rebase([options.branch]);
		if (options.push) await git.push();
	}

	if (options.keep) {
		if (!isDefault('branch') && options.push) {
			await git.checkout(options.branch);
			await git.push(options.remote, options.branch, ['--force']);
			await git.checkout(status.current);
		}
	} else {
		await git.deleteLocalBranch(options.branch, true);
	}
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
