import {promises as fs} from 'fs';
import _path from 'path';
import fg from 'fast-glob';
import _loadJsonFile from 'load-json-file';
import _writeJsonFile from 'write-json-file';
import YAML from 'yaml';
import simpleGit from 'simple-git';
import ncu from 'npm-check-updates';
import execa from 'execa';

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
		resolvedAbs !== resolvedRoot &&
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
export default function chcwd({cwd, offline}) {
	const read = (path) => fs.readFile(resolve(cwd, path), 'utf8');
	const write = (path, data) => fs.writeFile(resolve(cwd, path), data, 'utf8');
	const readJSON = (path) => _loadJsonFile(resolve(cwd, path));
	const writeJSON = (path, data) =>
		_writeJsonFile(resolve(cwd, path), data, {detectIndent: true});
	const readYAML = async (path) => YAML.parse(await read(path));
	const writeYAML = async (path, data) => write(path, YAML.stringify(data));
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
	const lintSources = () => execa('npm', ['run', 'lint'], {cwd});
	const fixSources = () => execa('npm', ['run', 'lint-and-fix'], {cwd});
	const lintConfig = () => execa('npm', ['run', 'lint-config'], {cwd});
	const fixConfig = () => execa('npm', ['run', 'lint-config-and-fix'], {cwd});
	const install = () => execa('yarn', offline ? ['--offline'] : [], {cwd});

	return {
		read,
		write,
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
		install,
	};
}
