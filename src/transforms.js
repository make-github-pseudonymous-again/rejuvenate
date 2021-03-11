import path from 'path';
import glob from 'fast-glob';
import {list, map} from '@aureooms/js-itertools';
import {increasing} from '@aureooms/js-compare';
import {sorted} from '@aureooms/js-topological-sorting';

function closure(operator, set) {
	const queue = [...set];
	const output = new Set(set);
	while (queue.length > 0) {
		const element = queue.pop();
		for (const product of operator(element)) {
			if (output.has(product)) continue;
			output.add(product);
			queue.push(product);
		}
	}

	return output;
}

const addExt = (t) => `${t}.js`;
const mod = (cwd, transform) => {
	const location = path.join(cwd, transform);
	const exports = require(location);
	return {
		name: transform,
		path: location,
		...exports,
	};
};

const deps = (cwd, transform) =>
	map(addExt, mod(cwd, transform).dependencies ?? []);
const end = '$';

function* edges(cwd, jobs) {
	for (const job of jobs) {
		for (const d of deps(cwd, job)) {
			yield [d, job];
		}

		yield [job, end];
	}
}

/**
 * Transforms.
 *
 * @param {String} cwd
 * @param {Array} globs
 */
export default async function* transforms(cwd, globs) {
	const patterns = list(map(addExt, globs));
	const paths = await glob(patterns, {cwd});
	const jobs = closure((t) => deps(cwd, t), paths);
	const sortedPaths = sorted(edges(cwd, jobs), increasing);
	for (const pathTail of sortedPaths) {
		if (pathTail === end) break;
		yield mod(cwd, pathTail);
	}
}
