import {sum} from '@iterable-iterator/reduce';
import {map} from '@iterable-iterator/map';
import textCount from '../text/count.js';

/**
 * Count all pattern/line matches.
 *
 * Uses String.replace semantics. See
 *   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
 *
 * @param {Iterable<RegExp|String>} patterns
 * @param {String} path
 * @param {Object} options
 * @return {Promise<Number>}
 */
async function countOne(patterns, path, {lines, method}) {
	let count = 0;
	for await (const line of lines) {
		count += sum(map((pattern) => method(pattern, line), patterns));
	}

	return count;
}

/**
 * Count all pattern/line combination matches.
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

count.regexp = textCount.regexp;
count.exact = textCount.exact;
