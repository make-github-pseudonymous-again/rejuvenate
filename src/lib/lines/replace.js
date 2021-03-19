import {reduce} from '@aureooms/js-itertools';
import textReplace from '../text/replace.js';

/**
 * Apply all replacement operations to each line of a given file .
 *
 * Uses String.replace semantics. See
 *   - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
 *
 * @param {Iterable} operations
 * @param {String} path
 * @param {Object} options
 */
async function replaceOne(operations, path, {lines, write, method}) {
	const buffer = [];
	let changed = false;
	for await (const line of lines(path)) {
		const replacedLine = reduce(method, operations, line);
		if (replacedLine !== line) changed = true;
		buffer.push(replacedLine);
	}

	if (changed && write) {
		const replaced = buffer.join('\n');
		await write(path, replaced ? replaced + '\n' : '');
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

replace.first = textReplace.first;
replace.all = textReplace.all;
