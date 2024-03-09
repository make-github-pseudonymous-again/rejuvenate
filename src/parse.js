import {fileURLToPath} from 'node:url';

import yargs from 'yargs';

import {INFO} from './util/logger.js';

const MAGIC = '89h2832fhao293819274hooeu';

/**
 * Parse an argument array.
 *
 * @param {Array} array
 */
export default function parse(array) {
	const parser = yargs(array)
		.usage('Usage: $0 <command> [options]')
		.command('patch', 'Patch a repo')
		.example(
			'$0 patch',
			'Patch the current working directory using all available transforms',
		)
		.demandCommand(1, 'must provide a valid command')
		.option('author', {
			type: 'string',
			describe: 'The author to use for all commits',
			demandOption: true,
			default:
				'a flying potato <80830782+a-flying-potato@users.noreply.github.com>',
		})
		.option('offline', {
			type: 'boolean',
			describe: 'Try to work offline if possible',
			demandOption: true,
			default: false,
		})
		.option('install', {
			type: 'boolean',
			describe: 'Whether to install the package dependencies when asked',
			demandOption: true,
			default: true,
		})
		.option('git-hooks', {
			type: 'boolean',
			describe: 'Whether to enable hooks for all relevant git operations',
			demandOption: true,
			default: true,
		})
		.option('test', {
			type: 'boolean',
			describe: 'Whether to test the package after some applied transform',
			demandOption: true,
			default: false,
		})
		.option('loglevel', {
			type: 'number',
			alias: 'l',
			describe: 'Verbosity level',
			demandOption: true,
			default: INFO,
			nargs: 1,
		})
		.option('max-subtasks', {
			type: 'number',
			describe: 'Maximum number of subtasks to display',
			demandOption: true,
			default: 10,
			nargs: 1,
		})
		.option('cwd', {
			type: 'string',
			alias: 'C',
			describe: 'Working directory',
			demandOption: true,
			default: '.',
			nargs: 1,
		})
		.option('branch', {
			type: 'string',
			alias: 'B',
			describe:
				'The git branch used to store all changes. You need to pass a different branch name than the default if you want to be able to push that branch to remote.',
			demandOption: true,
			default: `apply-rejuvenate-${MAGIC}`,
			nargs: 1,
		})
		.option('remote', {
			type: 'string',
			describe: 'The remote to use for all remote operations',
			demandOption: true,
			default: 'origin',
		})
		.option('status', {
			type: 'boolean',
			describe: 'Whether to check git status before starting',
			demandOption: true,
			default: true,
		})
		.option('pull', {
			type: 'boolean',
			describe: 'Whether to pull from remote before starting',
			demandOption: true,
			default: true,
		})
		.option('rebase', {
			type: 'boolean',
			describe: 'Whether to apply changes to current branch when finished',
			demandOption: true,
			default: false,
		})
		.option('keep', {
			type: 'boolean',
			describe: 'Whether to keep the local branch when finished',
			demandOption: true,
			default: true,
		})
		.option('push', {
			type: 'boolean',
			describe: 'Whether to push to remote when finished',
			demandOption: true,
			default: false,
		})
		.option('transformDir', {
			type: 'string',
			describe: 'Path to the directory containing all transforms',
			demandOption: true,
			default: fileURLToPath(new URL('transforms', import.meta.url)),
		})
		.option('transforms', {
			type: 'array',
			alias: 't',
			describe:
				'an array of globs to filter transforms to apply (https://github.com/sindresorhus/globby#globbing-patterns)',
			demandOption: true,
			default: ['*'],
		})
		.option('on-skip', {
			type: 'string',
			describe:
				'Action to take when a transform is skipped (except postcondition)',
			demandOption: true,
			default: 'skip-subtree',
			choices: ['skip-subtree', 'ignore'],
		})
		.help('h')
		.alias('h', 'help');

	const options = parser.parseSync();
	const command = options._[0];
	// @ts-ignore - Argv<>.getOptions is missing from @types/yargs
	const isDefault = (key) => options[key] === parser.getOptions().default[key];

	return {
		command,
		options,
		isDefault,
	};
}
