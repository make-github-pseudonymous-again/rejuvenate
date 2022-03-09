const addLeadingDotIfNecessary = (path) => {
	if (path.startsWith('./')) return path;
	if (path.startsWith('../')) return path;
	return './' + path;
};

export default addLeadingDotIfNecessary;
