import {promises} from 'fs';
import _path from 'path';
import fg from 'fast-glob';
import _loadJsonFile from 'load-json-file';
import _writeJsonFile from 'write-json-file';
import simpleGit from 'simple-git';
import ncu from 'npm-check-updates';

function resolve(root, path) {
	if (!path) throw new Error(`resolve: path must not be falsy (${path})`);
	if (typeof path !== 'string')
		throw new Error(`resolve: path must be a string (${path}: ${typeof path})`);
	if (/(^|\/)\.\.(\/|$)/.test(path))
		throw new Error(`resolve: path must not contain ".." (${path})`);

	// This last check is just in case we screwed something up.
	// NB: We cannot use _path.resolve since it would render [/foo, /bar] as /bar
	const resolved = _path.join(root, path);
	const resolvedAbs = _path.resolve(resolved);
	const resolvedRoot = _path.resolve(root);
	if (
		resolvedAbs !== resolvedRoot ||
		!resolvedAbs.startsWith(resolvedRoot + '/')
	) {
		throw new Error(
			`resolve: path must be inside root (${root} + ${path} ~> ${resolved})`,
		);
	}

	return resolvedAbs;
}

/**
 * Patch commonly used fs operations to run with the given cwd.
 */
export default function chcwd({cwd}) {
	const read = (path) => promises.readFile(resolve(cwd, path), 'utf8');
	const write = (path, data) =>
		promises.writeFile(resolve(cwd, path), data, 'utf8');
	const readJSON = (path) => _loadJsonFile(resolve(cwd, path));
	const writeJSON = (path, data) =>
		_writeJsonFile(resolve(cwd, path), data, {detectIndent: true});
	const readPkg = () => readJSON('package.json');
	const writePkg = (data) => writeJSON('package.json', data);
	const glob = (patterns, options) => fg.stream(patterns, {...options, cwd});
	const git = simpleGit({baseDir: cwd});
	const upgrade = (filter) =>
		ncu.run({
			packageFile: resolve(cwd, 'package.json'),
			filter,
			upgrade: true,
		});

	return {
		read,
		write,
		readJSON,
		writeJSON,
		readPkg,
		writePkg,
		upgrade,
		glob,
		git,
	};
}
