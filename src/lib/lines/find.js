import {any} from '@iterable-iterator/reduce';
import {map} from '@iterable-iterator/map';

import textFind from '../text/find.js';

/**
 * Returns true if any pattern matches any line of the input file.
 *
 * Uses String.replace semantics. See
 *   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
 *
 * @param {Iterable<RegExp|String>} patterns
 * @param {String} path
 * @param {Object} options
 * @return {Promise<boolean>}
 */
async function findOne(patterns, path, {lines, method}) {
	for await (const line of lines(path)) {
		if (any(map((pattern) => method(pattern, line), patterns))) {
			return true;
		}
	}

	return false;
}

/**
 * Returns true if any pattern/line combination matches.
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

find.regexp = textFind.regexp;
find.exact = textFind.exact;
