import update from '../lib/update.js';

export default function updateScripts({scripts}) {
	return {
		postcondition: async ({readPkg, assert}) => {
			const pkgjson = await readPkg();
			for (const [script, {newDefinition}] of Object.entries(scripts)) {
				assert(pkgjson.scripts[script] === newDefinition);
			}
		},

		precondition: async ({readPkg, assert}) => {
			const pkgjson = await readPkg();
			for (const [script, {oldDefinition}] of Object.entries(scripts)) {
				assert(pkgjson.scripts[script] === oldDefinition);
			}
		},

		apply: async ({readPkg, writePkg, fixConfig}) => {
			await update({
				read: readPkg,
				write: writePkg,
				edit: (pkgjson) => {
					for (const [script, {newDefinition}] of Object.entries(scripts)) {
						pkgjson.scripts[script] = newDefinition;
					}

					return pkgjson;
				},
			});
			await fixConfig();
		},
	};
}
