import update from '../lib/update.js';

export default function addPackageJSONKey(key, value) {
	return {
		async postcondition({readPkg, assert}) {
			const pkgjson = await readPkg();
			assert.deepStrictEqual(pkgjson[key], value);
		},

		async precondition({readPkg, assert}) {
			const pkgjson = await readPkg();
			assert(pkgjson[key] === undefined);
		},

		async apply({readPkg, writePkg, fixConfig}) {
			await update({
				read: readPkg,
				write: writePkg,
				edit(pkgjson) {
					pkgjson[key] = value;
					return pkgjson;
				},
			});
			await fixConfig();
		},
	};
}
