import update from '../lib/update.js';
import {sortKeys} from '../lib/ava.js';
import {replaceOrInsert, remove as removeKey} from '../lib/babel.js';

export const description = 'Drop --experimental-loader node flag.';

export const commit = {
	type: 'config',
	scope: 'ava',
	subject: description,
};

const oldEntry = '--experimental-loader=@node-loader/core';
const newEntry =
	"--import=data:text/javascript,import {register} from 'node:module'; import {pathToFileURL} from 'node:url'; register('@node-loader/core', pathToFileURL('./'))";

export async function postcondition({readPkg, assert}) {
	const {ava} = await readPkg();
	assert(ava !== undefined);
	assert(Array.isArray(ava.nodeArguments));
	assert(!ava.nodeArguments.includes(oldEntry));
	assert(ava.nodeArguments.includes(newEntry));
}

export async function precondition({readPkg, assert}) {
	const {ava} = await readPkg();
	assert(ava !== undefined);
	assert(Array.isArray(ava.nodeArguments));
	assert(ava.nodeArguments.includes(oldEntry));
	assert(!ava.nodeArguments.includes(newEntry));
}

export async function apply({readPkg, writePkg, fixConfig}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			removeKey(pkgjson.ava, 'nodeArguments', oldEntry);
			replaceOrInsert(pkgjson.ava, 'nodeArguments', newEntry);
			pkgjson.ava = sortKeys(pkgjson.ava);
			return pkgjson;
		},
	});
	await fixConfig();
}

export const dependencies = ['ava:test-build'];
