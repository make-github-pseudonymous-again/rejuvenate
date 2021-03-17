import {promises as fs} from 'fs';
import path from 'path';
import glob from 'fast-glob';
import Listr from 'listr';
import {list, map, filter, any} from '@aureooms/js-itertools';
import {increasing} from '@aureooms/js-compare';
import {sorted} from '@aureooms/js-topological-sorting';
import simpleGit from 'simple-git';
import pkgDir from 'pkg-dir';
import findUp from 'find-up';
import _loadJsonFile from 'load-json-file';

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
		dirname: cwd,
		name: transform,
		path: location,
		...exports,
	};
};

async function* resolveSource(transform) {
	try {
		const sourceMap = await _loadJsonFile(`${transform.path}.map`);
		const s2 = await fs.stat(transform.path, {bigint: true});
		for (const source of sourceMap.sources) {
			// eslint-disable-next-line no-await-in-loop
			const s1 = await fs.stat(path.join(transform.dirname, source), {
				bigint: true,
			});
			if (s1.mtimeNs > s2.mtimeNs) {
				yield transform.name;
				return;
			}
		}

		for (const source of sourceMap.sources) yield source;
	} catch (error) {
		if (error.code === 'ENOENT') yield transform.name;
		else {
			throw error;
		}
	}
}

async function* urlsAsyncGen(transform) {
	const git = simpleGit({baseDir: transform.dirname});
	if (await findUp('node_modules', {cwd: transform.dirname})) {
		// Check if likely published on NPM.
		// TODO check with NPM directly to be sure.
		const root = await pkgDir(transform.dirname);
		if (root) {
			const _path = path.relative(root, transform.location);
			const {name, version} = await _loadJsonFile(
				path.join(root, 'package.json'),
			);
			if (name && version && _path) {
				yield `https://unpkg.com/${name}@${version}/${_path}`;
			}
		}
	} else if (await git.checkIsRepo()) {
		// Check if likely to be part of a commit available on github
		for await (const source of resolveSource(transform)) {
			const _path = (await git.raw(['ls-files', '--full-name', source])).slice(
				0,
				-1,
			);
			if (_path) {
				const status = await git.status();
				if (
					!any(map((f) => _path === f.path || _path === f.from, status.files))
				) {
					const commit = await git.revparse('HEAD');
					const remotes = await git.getRemotes(true);
					const ghHTTPRemotes = filter(
						(f) => f.startsWith('https://github.com/'),
						map(
							(x) =>
								x.refs.fetch
									.replace(/\.git$/, '')
									.replace(/^http:\/\//, 'https://'),
							remotes,
						),
					);
					for (const remote of ghHTTPRemotes) {
						yield `${remote}/blob/${commit}/${_path}`;
					}
				}
			}
		}
	}
}

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

export function transformToTask(transform, options, globals) {
	return {
		title: `${transform.title ?? transform.description} (${transform.name})`,
		// /!\ enabled does not support async function
		// enabled: () => checkPreCondition(transform, globals),
		// skip: () => checkPostCondition(transform, globals),
		enabled: () => Boolean(transform.apply),
		skip: async () => {
			if (await checkPostCondition(transform, globals)) return 'postcondition';
			if (!(await checkPreCondition(transform, globals))) return 'precondition';
			return false;
		},
		task: () => exec(transform, options, globals),
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

const aita = async (it) => {
	const out = [];
	for await (const element of it) {
		out.push(element);
	}

	return out;
};

async function getCommitMessageLines(transform) {
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

	const urls = await aita(urlsAsyncGen(transform));

	const intro = 'These changes were automatically generated by';

	if (urls.length === 0) {
		commitMessageLines.push(`${intro} an uncommited transform.`);
	} else {
		commitMessageLines.push(
			[
				`${intro} a transform whose code can be found at:`,
				...urls.map((url) => `  - ${url}`),
				'Please contact the author of the transform if you believe there was an error.',
			].join('\n'),
		);
	}

	return commitMessageLines;
}

export default function exec(transform, {gitHooks, author}, {git, ...globals}) {
	return new Listr([
		{
			title: 'Compute stuff in parallel',
			task: () =>
				new Listr(
					[
						{
							title: 'Generate commit message and options',
							task: async (ctx) => {
								ctx.commitMessage = await getCommitMessageLines(transform);
								ctx.commitOptions = {
									'--all': true,
									'--author': author,
								};
								if (!gitHooks) ctx.commitOptions['--no-verify'] = true;
							},
						},
						{
							title: 'Apply, check, and stage',
							task: () =>
								new Listr([
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
								]),
						},
					],
					{concurrent: 2},
				),
		},
		{
			title: 'Commit staged changes',
			task: (ctx) => git.commit(ctx.commitMessage, ctx.commitOptions),
		},
	]);
}
