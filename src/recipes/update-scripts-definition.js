import update from '../lib/update.js';

export default function updateScripts({scripts}) {
	return {
		async postcondition({readPkg, assert}) {
			const pkgjson = await readPkg();
			for (const [script, {newDefinition}] of Object.entries(scripts)) {
				assert(pkgjson.scripts[script] === newDefinition);
			}
		},

		async precondition({readPkg, assert}) {
			const pkgjson = await readPkg();
			for (const [script, {oldDefinition}] of Object.entries(scripts)) {
				assert(pkgjson.scripts[script] === oldDefinition);
			}
		},

		async apply({readPkg, writePkg, fixConfig}) {
			await update({
				read: readPkg,
				write: writePkg,
				edit(pkgjson) {
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
