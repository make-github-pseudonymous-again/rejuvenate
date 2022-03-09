import {promises as fs} from 'node:fs';
import _path from 'node:path';
import fg from 'fast-glob';
import makeDir from 'make-dir';
import {loadJsonFile} from 'load-json-file';
import {writeJsonFile} from 'write-json-file';
import simpleGit from 'simple-git';
import {run as ncu} from 'npm-check-updates';
import {execa} from 'execa';
import del from 'del';
import {moveFile} from 'move-file';

import parseYAML from '../lib/yaml/parse.js';
import stringifyYAML from '../lib/yaml/stringify.js';

import addLeadingDotIfNecessary from './addLeadingDotIfNecessary.js';
import partialRequireResolve from './partialRequireResolve.js';
import _lines from './lines.js';

function _resolve(root, path) {
	if (!path) throw new Error(`resolve: path must not be falsy (${path})`);
	if (typeof path !== 'string')
		throw new Error(`resolve: path must be a string (${path}: ${typeof path})`);

	// NB: We cannot use _path.resolve since it would render [/foo, /bar] as /bar
	const resolved = _path.join(root, path);
	const resolvedAbs = _path.resolve(resolved);
	const resolvedRoot = _path.resolve(root);

	if (/(^|\/)\.\.(\/|$)/.test(resolvedAbs))
		throw new Error(`fatal: resolvedAbs contains ".." (${resolvedAbs})`);

	// We check that resolvedAbs is a child of resolvedRoot
	if (
		resolvedAbs !== resolvedRoot &&
		!resolvedAbs.startsWith(resolvedRoot + '/')
	) {
		throw new Error(
			`resolve: path must be inside root (${root} + ${path} ~> ${resolved})`,
		);
	}

	return resolvedAbs;
}

const DEFAULT_ENCODING = 'utf8';

/**
 * Patch commonly used fs operations to run with the given cwd.
 */
export default function chcwd({
	cwd,
	offline,
	install: installFlag,
	test: testFlag,
}) {
	const noop = () => {};
	const exists = (path) =>
		read(path).then(
			() => true,
			() => false,
		);
	const read = (path) => fs.readFile(_resolve(cwd, path), DEFAULT_ENCODING);
	const write = async (path, data, options) => {
		const resolvedPath = _resolve(cwd, path);
		await makeDir(_path.dirname(resolvedPath));
		await fs.writeFile(resolvedPath, data, DEFAULT_ENCODING);
		if (options?.mode !== undefined) {
			await fs.chmod(resolvedPath, options.mode);
		}
	};

	const lines = (path) => _lines(_resolve(cwd, path));

	const readJSON = (path) => loadJsonFile(_resolve(cwd, path));
	const writeJSON = (path, data) =>
		writeJsonFile(_resolve(cwd, path), data, {
			detectIndent: true,
			indent: '  ',
		});
	const readYAML = async (path) => parseYAML(await read(path));
	const writeYAML = async (path, data) => write(path, stringifyYAML(data));
	const readPkg = () => readJSON('package.json');
	const writePkg = (data) => writeJSON('package.json', data);
	const glob = (patterns, options) => fg.stream(patterns, {...options, cwd});
	const git = simpleGit({baseDir: cwd});
	const upgrade = (filter, options) =>
		ncu({
			packageFile: _resolve(cwd, 'package.json'),
			filter,
			upgrade: true,
			...options,
		});
	const lintSources = () => execa('npm', ['run', 'lint'], {cwd});
	const fixSources = () => execa('npm', ['run', 'lint-and-fix'], {cwd});
	const lintConfig = () => execa('npm', ['run', 'lint-config'], {cwd});
	const fixConfig = () => execa('npm', ['run', 'lint-config-and-fix'], {cwd});
	const yarn = (...args) =>
		execa('yarn', offline ? ['--offline', ...args] : [...args], {cwd});
	const test = testFlag ? () => yarn('test') : noop;
	const remove = (patterns) => del(patterns, {cwd});
	const move = (a, b) =>
		moveFile(_resolve(cwd, a), _resolve(cwd, b), {overwrite: false});
	const install = installFlag ? () => yarn('install') : noop;

	const resolveRequire = (from, to) => {
		const path = _resolve(cwd, from);
		return partialRequireResolve(path, to);
	};

	const resolve = (...parts) =>
		addLeadingDotIfNecessary(
			_path.relative(cwd, _resolve(cwd, _path.join(...parts))),
		);
	const resolveFromFile = (from, to) => resolve(_path.dirname(from), to);

	return {
		exists,
		read,
		write,
		lines,
		readJSON,
		writeJSON,
		readYAML,
		writeYAML,
		readPkg,
		writePkg,
		upgrade,
		glob,
		git,
		lintSources,
		fixSources,
		lintConfig,
		fixConfig,
		test,
		remove,
		move,
		install,
		resolveRequire,
		resolve,
		resolveFromFile,
	};
}
