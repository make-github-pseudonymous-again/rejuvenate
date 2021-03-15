import path from 'path';
import yargs from 'yargs/yargs';
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
		.option('offline', {
			type: 'boolean',
			describe: 'Try to work offline if possible',
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
			default: path.join(__dirname, 'transforms'),
		})
		.option('transforms', {
			type: 'array',
			alias: 't',
			describe:
				'an array of globs to filter transforms to apply (https://github.com/sindresorhus/globby#globbing-patterns)',
			demandOption: true,
			default: ['*'],
		})
		.help('h')
		.alias('h', 'help');

	const options = parser.argv;
	const command = options._[0];
	const isDefault = (key) => options[key] === parser.getOptions().default[key];

	return {
		command,
		options,
		isDefault,
	};
}
