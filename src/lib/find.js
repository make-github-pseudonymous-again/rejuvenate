import {any, map} from '@aureooms/js-itertools';

/**
 * Apply all replacement operations in one file .
 *
 * Uses String.replace semantics. See
 *   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
 *
 * @param {Iterable<RegExp>} patterns
 * @param {String} path
 * @param {Object} options
 * @return {Promise<boolean>}
 */
async function findOne(patterns, path, {read}) {
	const text = await read(path);
	return any(map((pattern) => pattern.test(text), patterns));
}

/**
 * Apply {@link replaceOne} to all given paths.
 *
 * @param {Array<RegExp>} patterns
 * @param {Iterable} paths
 * @param {Object} options
 * @return {Promise<boolean>}
 */
export default async function find(patterns, paths, options) {
	for await (const path of paths) {
		if (await findOne(patterns, path, options)) return true;
	}

	return false;
}
