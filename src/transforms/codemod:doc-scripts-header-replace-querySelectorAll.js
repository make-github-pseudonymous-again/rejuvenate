import find from '../lib/code/find.js';
import replace from '../lib/code/replace.js';

export const description =
	'Replace querySelectorAll(...)[0] by querySelector(...) in docs scripts.';

export const commit = {
	type: 'docs',
	subject: 'Simplify scripts.',
};

const paths = ['doc/scripts/header.js'];

const filter = (node, {is, n}) => {
	if (!is(node, n.MemberExpression)) return false;
	const {object, property} = node;
	if (!is(object, n.CallExpression)) return false;
	if (!is(property, n.Literal)) return false;
	if (property.value !== 0) return false;
	const callee = object.callee;
	return (
		is(callee, n.MemberExpression) &&
		callee.object.name === 'document' &&
		callee.property.name === 'querySelectorAll'
	);
};

const map = ({object: {callee, arguments: args}}, {b}) => {
	return b.callExpression(
		b.memberExpression(callee.object, b.identifier('querySelector')),
		args,
	);
};

export async function postcondition({read, assert}) {
	const found = await find([{filter}], paths, {read});
	assert(!found);
}

export async function precondition({read, assert}) {
	const found = await find([{filter}], paths, {read});
	assert(found);
}

export async function apply({read, write, fixSources}) {
	await replace([{filter, map}], paths, {read, write});
	await fixSources();
}

export const dependencies = ['sources:lint-setup'];
