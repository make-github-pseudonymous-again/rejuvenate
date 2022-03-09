import update from '../lib/update.js';

export default function addPackageJSONKey(key, value) {
	return {
		postcondition: async ({readPkg, assert}) => {
			const pkgjson = await readPkg();
			assert.deepStrictEqual(pkgjson[key], value);
		},

		precondition: async ({readPkg, assert}) => {
			const pkgjson = await readPkg();
			assert(pkgjson[key] === undefined);
		},

		apply: async ({readPkg, writePkg, fixConfig}) => {
			await update({
				read: readPkg,
				write: writePkg,
				edit: (pkgjson) => {
					pkgjson[key] = value;
					return pkgjson;
				},
			});
			await fixConfig();
		},
	};
}
