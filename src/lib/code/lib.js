import {types} from 'recast';
const n = types.namedTypes;
const b = types.builders;

const is = (node, type) => node?.type === type.name;

const lib = {
	is,
	n,
	b,
};

export default lib;
