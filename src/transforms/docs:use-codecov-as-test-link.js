import find from '../lib/code/find.js';
import replace from '../lib/code/replace.js';

export const description = 'Use codecov as test link.';

export const commit = {
	type: 'docs',
	subject: description,
};

const newValue = (oldValue) => {
	const [owner, repo] = oldValue.split('/').slice(-2);
	if (owner === undefined || repo === undefined) return oldValue;
	return `https://app.codecov.io/gh/${owner}/${repo}`;
};

const paths = ['doc/scripts/header.js'];

const filter = (node, {is, n}) => {
	if (!is(node, n.AssignmentExpression)) return false;
	const {operator, left, right} = node;
	if (!is(left, n.MemberExpression)) return false;
	if (!is(right, n.Literal)) return false;
	const {object, property} = left;
	if (!is(object, n.Identifier)) return false;
	if (!is(property, n.Identifier)) return false;
	return (
		object.name === 'testlink' &&
		property.name === 'href' &&
		operator === '=' &&
		right.value !== newValue(right.value)
	);
};

const map = ({operator, left, right}, {b}) => {
	return b.assignmentExpression(
		operator,
		left,
		b.literal(newValue(right.value)),
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

export const dependencies = [
	'sources:lint-setup',
	'github:workflow-configure-ci:test',
];
