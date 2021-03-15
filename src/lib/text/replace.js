import {reduce} from '@aureooms/js-itertools';

/**
 * Replace first match. Throws if pattern is RegExp and global.
 *
 * @param {String} current
 * @param {Array} operation
 */
const replaceFirst = (current, [pattern, replacement]) => {
	if (pattern instanceof RegExp && pattern.global) {
		// We fix the broken API.
		throw new Error('Cannot replace first match with global pattern.');
	}

	return current.replace(pattern, replacement);
};

/**
 * Replace all matches. Throws if pattern is RegExp and non-global.
 *
 * @param {String} current
 * @param {Array} operation
 */
const replaceAll = (current, [pattern, replacement]) =>
	current.replaceAll(pattern, replacement);

/**
 * Apply all replacement operations in one file .
 *
 * Uses String.replace semantics. See
 *   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
 *
 * @param {Iterable} operations
 * @param {String} path
 * @param {Object} options
 */
async function replaceOne(operations, path, {read, write, method}) {
	const original = await read(path);
	const replaced = reduce(method, operations, original);
	if (replaced !== original && write) {
		await write(path, replaced);
	}
}

/**
 * Apply {@link replaceOne} to all given paths.
 *
 * @param {Array} operations
 * @param {Iterable} paths
 * @param {Object} options
 */
export default async function replace(operations, paths, options) {
	for await (const path of paths) {
		await replaceOne(operations, path, options);
	}
}

replace.first = replaceFirst;
replace.all = replaceAll;
