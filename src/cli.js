#!/usr/bin/env node

import process from 'node:process';

// eslint-disable-next-line import/no-unassigned-import
import 'regenerator-runtime/runtime.js';

import main from './main.js';

try {
	await main(process.argv);
	process.exitCode = 0;
} catch (error) {
	console.error({error});
	process.exitCode = 1;
}
