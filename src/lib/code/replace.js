import {parse, visit, print, utils} from './lib.js';

/**
 * CodemodOne.
 *
 * @param {Iterable} visitors
 * @param {String} path
 * @param {Object} options
 */
async function codemodOne(visitors, path, {read, write, printOptions}) {
	const original = await read(path);

	const ast = parse(original, {sourceFileName: path});
	for (const visitor of visitors) visit(ast, visitor);
	const replaced = print(ast, printOptions).code;

	if (replaced !== original && write) {
		await write(path, replaced);
	}
}

/**
 * Codemod.
 *
 * @param {Array<Object>} visitors
 * @param {Iterable} paths
 * @param {Object} options
 */
async function codemod(visitors, paths, options) {
	for await (const path of paths) {
		await codemodOne(visitors, path, options);
	}
}

export default function replace(operations, paths, options) {
	const visitors = operations
		.map((options) => ({recurse: () => true, ...options}))
		.map(({filter, map, recurse}) => ({
			visitNode(path) {
				if (filter(path.node, utils)) path.replace(map(path.node, utils));
				if (!recurse(path.node, utils)) return false;
				this.traverse(path);
			},
		}));
	return codemod(visitors, paths, options);
}
