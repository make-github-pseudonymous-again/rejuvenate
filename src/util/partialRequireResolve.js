import path from 'node:path';
import {createRequire} from 'node:module';

import addLeadingDotIfNecessary from './addLeadingDotIfNecessary.js';

const require = createRequire(import.meta.url);

const partialRequireResolve = (from, to) => {
	const dir = path.dirname(from);
	let result = to;
	try {
		result = require.resolve(to, {paths: [dir]});
	} catch (error) {
		if (error.code !== 'MODULE_NOT_FOUND') throw error;
	}

	if (/^(@[^/]+\/|)[^./]+$/.test(to)) return to;
	if (/\/node_modules\//.test(result)) {
		return result.split('/node_modules/').pop();
	}

	return path.isAbsolute(to)
		? result
		: addLeadingDotIfNecessary(path.relative(dir, result));
};

export default partialRequireResolve;
