import * as pkg from '../lib/pkg.js';
import update from '../lib/update.js';

const removeScripts = (options) =>
	subroutine({scripts: [], deps: [], files: [], config: [], ...options});

export default removeScripts;

function subroutine({scripts, deps, files, config}) {
	return {
		async postcondition({readPkg, exists, assert}) {
			const pkgjson = await readPkg();
			const devDeps = pkg.devDeps(pkgjson);
			for (const dep of deps) assert(!devDeps.has(dep));
			for (const key of scripts) {
				assert(pkgjson.scripts[key] === undefined);
			}

			for (const key of config) {
				assert(pkgjson[key] === undefined);
			}

			for (const filename of files) {
				// eslint-disable-next-line no-await-in-loop
				assert(!(await exists(filename)));
			}
		},

		async precondition({readPkg, exists, assert}) {
			const pkgjson = await readPkg();
			const devDeps = pkg.devDeps(pkgjson);
			for (const dep of deps) assert(devDeps.has(dep));
			for (const key of scripts) {
				assert(pkgjson.scripts[key] !== undefined);
			}

			for (const key of config) {
				assert(pkgjson[key] !== undefined);
			}

			for (const filename of files) {
				// eslint-disable-next-line no-await-in-loop
				assert(await exists(filename));
			}
		},

		async apply({readPkg, writePkg, remove, fixConfig, install}) {
			await update({
				read: readPkg,
				write: writePkg,
				edit(pkgjson) {
					for (const dep of deps) delete pkgjson.devDependencies[dep];
					for (const key of scripts) delete pkgjson.scripts[key];
					for (const key of config) delete pkgjson[key];
					return pkgjson;
				},
			});
			await remove(files);
			await fixConfig();
			await install();
		},
	};
}
