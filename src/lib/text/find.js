import {any, map} from '@aureooms/js-itertools';

/**
 * Test whether substring occurs in text.
 *
 * @param {String} substring
 * @param {String} text
 */
const stringFind = (substring, text) => text.includes(substring);

/**
 * Test whether pattern occurs in text.
 *
 * @param {RegExp} pattern
 * @param {String} text
 */
const regexpFind = (pattern, text) => pattern.test(text);

/**
 * Returns true if any pattern matches.
 *
 * Uses String.replace semantics. See
 *   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
 *
 * @param {Iterable<RegExp|String>} patterns
 * @param {String} path
 * @param {Object} options
 * @return {Promise<boolean>}
 */
async function findOne(patterns, path, {read, method}) {
	const text = await read(path);
	return any(map((pattern) => method(pattern, text), patterns));
}

/**
 * Returns true if any pattern/contents combination matches.
 *
 * @param {Array<RegExp|String>} patterns
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

find.regexp = regexpFind;
find.exact = stringFind;
