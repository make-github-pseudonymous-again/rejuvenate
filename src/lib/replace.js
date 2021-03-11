import {reduce} from '@aureooms/js-itertools';

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
async function replaceOne(operations, path, {read, write}) {
	const original = await read(path);
	const replaced = reduce(
		(current, [pattern, replacement]) => current.replace(pattern, replacement),
		operations,
		original,
	);
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
