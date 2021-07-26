import {sum} from '@iterable-iterator/reduce';
import {map} from '@iterable-iterator/map';
import {count as _count} from '@iterable-iterator/cardinality';

/**
 * Count non-overlapping substring occurrences in text.
 *
 * @param {String} substring
 * @param {String} text
 */
const stringCount = (substring, text) => {
	let count = 0;
	let position = -1;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		position = text.indexOf(substring, position + 1);
		if (position === -1) break;
		++count;
	}

	return count;
};

/**
 * Count non-overlapping pattern occurrences in text.
 *
 * @param {RegExp} pattern
 * @param {String} text
 */
const regexpCount = (pattern, text) => _count(text.matchAll(pattern));

/**
 * Count all pattern matches.
 *
 * Uses String.replace semantics. See
 *   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
 *
 * @param {Iterable<RegExp|String>} patterns
 * @param {String} path
 * @param {Object} options
 * @return {Promise<Number>}
 */
async function countOne(patterns, path, {read, method}) {
	const text = await read(path);
	return sum(map((pattern) => method(pattern, text), patterns));
}

/**
 * Count all pattern/contents combination matches.
 *
 * @param {Array<RegExp|String>} patterns
 * @param {Iterable} paths
 * @param {Object} options
 * @return {Promise<Number>}
 */
export default async function count(patterns, paths, options) {
	let count = 0;
	for await (const path of paths) {
		count += await countOne(patterns, path, options);
	}

	return count;
}

count.regexp = regexpCount;
count.exact = stringCount;
