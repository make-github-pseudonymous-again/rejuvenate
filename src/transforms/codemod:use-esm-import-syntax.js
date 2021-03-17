import find from '../lib/code/find.js';
import replace from '../lib/code/replace.js';

export const description = 'Use ESM import syntax.';

export const commit = {
	type: 'refactor',
	subject: description,
};

const patterns = ['src/**/*.js', 'test/src/**/*.js'];

const filter = (resolveImport) => (node, {is, n}) => {
	if (!is(node, n.ImportDeclaration)) return false;
	if (!is(node.source, n.Literal)) return false;
	const source = node.source.value;
	if (typeof source !== 'string') return false;
	const path = node.loc?.lines?.name;
	if (typeof path !== 'string') return false;
	if (source === resolveImport(path, source)) return false;
	return true;
};

const map = (resolveImport) => (node, {b}) => {
	const resolved = resolveImport(node.loc.lines.name, node.source.value);
	node.source = b.literal(resolved);
	return node;
};

export async function postcondition({read, glob, resolveImport, assert}) {
	const found = await find([{filter: filter(resolveImport)}], glob(patterns), {
		read,
	});
	assert(!found);
}

export async function precondition({read, glob, resolveImport, assert}) {
	const found = await find([{filter: filter(resolveImport)}], glob(patterns), {
		read,
	});
	assert(found);
}

export async function apply({read, write, glob, resolveImport}) {
	await replace(
		[{filter: filter(resolveImport), map: map(resolveImport)}],
		glob(patterns),
		{read, write},
	);
}
