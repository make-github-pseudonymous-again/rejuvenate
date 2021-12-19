import find from '../lib/code/find.js';
import replace from '../lib/code/replace.js';

export const description = 'Use ESM import syntax.';

export const commit = {
	type: 'refactor',
	subject: description,
};

const patterns = ['src/**/*.js', 'test/src/**/*.js'];

const filter =
	(resolveRequire) =>
	(node, {is, n}) => {
		if (is(node, n.ImportDeclaration) || is(node, n.ExportAllDeclaration)) {
			if (!is(node.source, n.Literal)) return false;
			const source = node.source.value;
			if (typeof source !== 'string') return false;
			const path = node.loc?.lines?.name;
			if (typeof path !== 'string') return false;
			if (source === resolveRequire(path, source)) return false;
			return true;
		}

		return false;
	};

const map =
	(resolveRequire) =>
	(node, {b}) => {
		const resolved = resolveRequire(node.loc.lines.name, node.source.value);
		node.source = b.literal(resolved);
		return node;
	};

export async function postcondition({read, glob, resolveRequire, assert}) {
	const found = await find([{filter: filter(resolveRequire)}], glob(patterns), {
		read,
	});
	assert(!found);
}

export async function precondition({read, glob, resolveRequire, assert}) {
	const found = await find([{filter: filter(resolveRequire)}], glob(patterns), {
		read,
	});
	assert(found);
}

export async function apply({read, write, glob, resolveRequire}) {
	await replace(
		[{filter: filter(resolveRequire), map: map(resolveRequire)}],
		glob(patterns),
		{read, write, printOptions: {quote: 'single'}},
	);
}
