#!/usr/bin/env node

// eslint-disable-next-line import/no-unassigned-import
import 'regenerator-runtime/runtime.js';

import process from 'node:process';
import main from './main.js';

main(process.argv).then(
	() => {
		process.exitCode = 0;
	},
	(error) => {
		console.error({error});
		process.exitCode = 1;
	},
);
