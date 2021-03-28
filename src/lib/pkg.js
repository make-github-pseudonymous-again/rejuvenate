const keySet = (object) => new Set(Object.keys(object));

const replaceEntry = (object, oldKey, newKey, newValue) =>
	Object.fromEntries(
		Object.entries(object).map(([k, v]) =>
			k === oldKey ? [newKey, newValue] : [k, v],
		),
	);

export function deps(object) {
	return keySet(object.dependencies);
}

export function devDeps(object) {
	return keySet(object.devDependencies);
}

export function replaceDep(object, oldKey, newKey) {
	object.dependencies =
		object.dependencies &&
		replaceEntry(object.dependencies, oldKey, newKey, '0.0.0');
	object.devDependencies =
		object.devDependencies &&
		replaceEntry(object.devDependencies, oldKey, newKey, '0.0.0');
}

export function addDep(object, dep) {
	if (!object.dependencies) object.dependencies = {};
	if (!object.dependencies[dep]) object.dependencies[dep] = '0.0.0';
}

export function addDevDep(object, dep) {
	if (!object.devDependencies) object.devDependencies = {};
	if (!object.devDependencies[dep]) object.devDependencies[dep] = '0.0.0';
}
