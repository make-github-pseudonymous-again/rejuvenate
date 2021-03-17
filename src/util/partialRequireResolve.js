import path from 'path';

const addLeadingDotIfNecessary = (path) => {
	if (path.startsWith('./')) return path;
	if (path.startsWith('../')) return path;
	return './' + path;
};

const partialRequireResolve = (from, to) => {
	const dir = path.dirname(from);
	const result = require.resolve(to, {paths: [dir]});
	if (/\/node_modules\//.test(result)) {
		if (/^[^./]*$/.test(to)) return to;
		return result.split('/node_modules/').pop();
	}

	return path.isAbsolute(to)
		? result
		: addLeadingDotIfNecessary(path.relative(dir, result));
};

export default partialRequireResolve;
