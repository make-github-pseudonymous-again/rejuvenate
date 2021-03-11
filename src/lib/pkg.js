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
	object.dependencies = replaceEntry(
		object.dependencies,
		oldKey,
		newKey,
		'0.0.0',
	);
	object.devDependencies = replaceEntry(
		object.devDependencies,
		oldKey,
		newKey,
		'0.0.0',
	);
}
