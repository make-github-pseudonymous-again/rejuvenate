import {parse, visit} from 'recast';
import {any, map} from '@aureooms/js-itertools';

import lib from './lib.js';

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
			if (filter(path.node, lib)) {
				found = true;
				this.abort();
			}

			if (!recurse(path.node, lib)) return false;
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

export default async function find(patterns, paths, options) {
	const patternsWithDefaults = patterns.map((options) => ({
		recurse: () => true,
		...options,
	}));
	for await (const path of paths) {
		if (await findOne(patternsWithDefaults, path, options)) return true;
	}

	return false;
}
