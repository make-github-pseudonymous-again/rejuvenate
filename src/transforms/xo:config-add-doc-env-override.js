import {any} from '@iterable-iterator/reduce';
import {map} from '@iterable-iterator/map';
import totalOrder from 'total-order';
import update from '../lib/update.js';

export const description = 'Add doc env override.';

export const commit = {
	type: 'config',
	scope: 'xo',
	subject: description,
};

const override = {
	files: ['doc/**'],
	env: 'browser',
};

const isDeepEqualTo = (expected) => (actual) =>
	totalOrder(actual, expected) === 0;

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(
		pkgjson.xo === undefined ||
			any(map(isDeepEqualTo(override), pkgjson.xo.overrides ?? [])),
	);
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	assert(
		pkgjson.xo !== undefined &&
			!any(map(isDeepEqualTo(override), pkgjson.xo.overrides ?? [])),
	);
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			if (pkgjson.xo.overrides === undefined) {
				pkgjson.xo.overrides = [];
			}

			pkgjson.xo.overrides.unshift(override);
			return pkgjson;
		},
	});
	await fixConfig();
}
