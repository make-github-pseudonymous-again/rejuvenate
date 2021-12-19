import {parse as _parse, types} from 'recast';
import * as parser from 'recast/parsers/babel.js'; // Requires @babel/parser

const n = types.namedTypes;
const b = types.builders;

const is = (node, type) => type.check(node);

export const utils = {
	is,
	n,
	b,
};

export const parse = (source, options) => _parse(source, {parser, ...options});

export {visit, print} from 'recast';
