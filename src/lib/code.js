import {parse, visit, print, types} from 'recast';
const n = types.namedTypes;
const b = types.builders;

import {any, map} from '@aureooms/js-itertools';

/**
 * CodemodOne.
 *
 * @param {Iterable} visitors
 * @param {String} path
 * @param {Object} options
 */
async function codemodOne(visitors, path, {read, write}) {
	const original = await read(path);

	const ast = parse(original);
	for (const visitor of visitors) visit(ast, visitor);
	const replaced = print(ast).code;

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

/**
 * Lookup.
 *
 * @param {Object} options
 * @param {any} ast
 */
function lookup({filter, recurse}, ast) {
	let found = false;
	visit(ast, {
		visitNode(path) {
			if (filter(path.node)) {
				found = true;
				this.abort();
			}

			if (!recurse(path.node)) return false;
			this.traverse(path);
		},
	});
	return found;
}

async function findOne(patterns, path, {read}) {
	const text = await read(path);
	const ast = parse(text);
	return any(map((pattern) => lookup(pattern, ast), patterns));
}

async function find(patterns, paths, options) {
	const patternsWithDefaults = patterns.map((options) => ({
		recurse: () => true,
		...options,
	}));
	for await (const path of paths) {
		if (await findOne(patternsWithDefaults, path, options)) return true;
	}

	return false;
}

function replace(operations, paths, options) {
	const visitors = operations
		.map((options) => ({recurse: () => true, ...options}))
		.map(({filter, map, recurse}) => ({
			visitNode(path) {
				if (filter(path.node)) path.replace(map(b, path.node));
				if (!recurse(path.node)) return false;
				this.traverse(path);
			},
		}));
	return codemod(visitors, paths, options);
}

export {codemod, find, replace, b, n};
