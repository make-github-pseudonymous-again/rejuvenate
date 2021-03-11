import path from 'path';
import glob from 'fast-glob';
import Listr from 'listr';
import {list, map} from '@aureooms/js-itertools';
import {increasing} from '@aureooms/js-compare';
import {sorted} from '@aureooms/js-topological-sorting';

function closure(operator, set) {
	const queue = [...set];
	const output = new Set(set);
	while (queue.length > 0) {
		const element = queue.pop();
		for (const product of operator(element)) {
			if (output.has(product)) continue;
			output.add(product);
			queue.push(product);
		}
	}

	return output;
}

const addExt = (t) => `${t}.js`;
const mod = (cwd, transform) => {
	const location = path.join(cwd, transform);
	const exports = require(location);
	return {
		name: transform,
		path: location,
		...exports,
	};
};

const deps = (cwd, transform) =>
	map(addExt, mod(cwd, transform).dependencies ?? []);
const end = '$';

function* edges(cwd, jobs) {
	for (const job of jobs) {
		for (const d of deps(cwd, job)) {
			yield [d, job];
		}

		yield [job, end];
	}
}

/**
 * Transforms.
 *
 * @param {String} cwd
 * @param {Array} globs
 */
export async function* fetchTransforms(cwd, globs) {
	const patterns = list(map(addExt, globs));
	const paths = await glob(patterns, {cwd});
	const jobs = closure((t) => deps(cwd, t), paths);
	const sortedPaths = sorted(edges(cwd, jobs), increasing);
	for (const pathTail of sortedPaths) {
		if (pathTail === end) break;
		yield mod(cwd, pathTail);
	}
}

export function transformToTask(transform, globals) {
	return {
		title: transform.name,
		enabled: () => checkPreCondition(transform, globals),
		skip: () => checkPostCondition(transform, globals),
		task: () => exec(transform, globals),
	};
}

async function run(transform, globals, action) {
	if (transform[action]) {
		await transform[action](globals);
	}
}

async function checkPreCondition(transform, globals) {
	try {
		await run(transform, globals, 'precondition');
		return true;
	} catch (error) {
		if (error instanceof globals.assert.AssertionError) return false;
		throw error;
	}
}

async function checkPostCondition(transform, globals) {
	try {
		await run(transform, globals, 'postcondition');
		return true;
	} catch (error) {
		if (error instanceof globals.assert.AssertionError) return false;
		throw error;
	}
}

export default function exec(transform, {git, ...globals}) {
	const commitMessageLines = [
		transform.commit?.message ||
			`${transform.commit?.emoji || ':robot:'} ${
				transform.commit?.type || 'chore'
			}${transform.commit?.scope ? '(' + transform.commit.scope + ')' : ''}: ${
				transform.commit?.subject || transform.name
			}`,
		!transform.description ||
		transform.description === transform.commit?.subject
			? ''
			: transform.description,
	];

	return new Listr([
		{
			title: 'Apply transform',
			task: () => run(transform, globals, 'apply'),
		},
		{
			title: 'Check postcondition',
			task: () => run(transform, globals, 'postcondition'),
		},
		{
			title: 'Stage changes',
			task: () => git.add('--all'),
		},
		{
			title: 'Commit staged changes',
			task: () => git.commit(commitMessageLines, {'--all': true}),
		},
	]);
}
