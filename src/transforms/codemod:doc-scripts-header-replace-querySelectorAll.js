import {find, replace} from '../lib/code.js';

export const description =
	'Replace querySelectorAll(...)[0] by querySelector(...) in docs scripts.';

export const commit = {
	type: 'docs',
	subject: 'Simplify scripts.',
};

const paths = ['doc/scripts/header.js'];

const filter = (node) => {
	if (node.type === 'MemberExpression') {
		const {object, property} = node;
		if (
			object.type === 'CallExpression' &&
			property.type === 'Literal' &&
			property.value === 0
		) {
			const callee = object.callee;
			if (
				callee.type === 'MemberExpression' &&
				callee.object.name === 'document' &&
				callee.property.name === 'querySelectorAll'
			)
				return true;
		}
	}

	return false;
};

const map = (b, {object: {callee, arguments: args}}) => {
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

export const dependencies = ['sources:initial-lint'];
