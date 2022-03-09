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

const DEFAULT_VERSION = '0.0.0';

export function replaceDep(object, oldKey, newKey, version = DEFAULT_VERSION) {
	object.dependencies =
		object.dependencies &&
		replaceEntry(object.dependencies, oldKey, newKey, version);
	object.devDependencies =
		object.devDependencies &&
		replaceEntry(object.devDependencies, oldKey, newKey, version);
}

export function addDep(object, dep, version = DEFAULT_VERSION) {
	if (!object.dependencies) object.dependencies = {};
	if (!object.dependencies[dep]) object.dependencies[dep] = version;
}

export function addDevDep(object, dep, version = DEFAULT_VERSION) {
	if (!object.devDependencies) object.devDependencies = {};
	if (!object.devDependencies[dep]) object.devDependencies[dep] = version;
}

export const removeDevDep = (object, dep) => {
	delete object.devDependencies[dep];
};
