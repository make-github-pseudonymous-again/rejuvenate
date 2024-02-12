import {all} from '@iterable-iterator/reduce';

export const description = 'Move config to `.commitlintrc.cjs`.';

export const commit = {
	type: 'config',
	scope: 'commitlint',
	subject: description,
};

const oldCommitLintConfig = '.commitlintrc.js';
const newCommitLintConfig = '.commitlintrc.cjs';

export async function postcondition({exists, assert}) {
	assert(
		all(
			await Promise.all([
				exists(oldCommitLintConfig).then((value) => !value),
				exists(newCommitLintConfig),
			]),
		),
	);
}

export async function precondition({exists, assert}) {
	assert(
		all(
			await Promise.all([
				exists(oldCommitLintConfig),
				exists(newCommitLintConfig).then((value) => !value),
			]),
		),
	);
}

export async function apply({move}) {
	await move(oldCommitLintConfig, newCommitLintConfig);
}

export const dependencies = ['commitlint:install'];
