import * as pkg from '../lib/pkg.js';
import update from '../lib/update.js';
import contains from '../lib/contains.js';

const addScripts = (options) =>
	subroutine({scripts: {}, deps: [], files: {}, config: {}, ...options});

export default addScripts;

function subroutine({scripts, deps, files, config}) {
	return {
		postcondition: async ({readPkg, read, assert}) => {
			const pkgjson = await readPkg();
			const devDeps = pkg.devDeps(pkgjson);
			for (const dep of deps) assert(devDeps.has(dep));
			for (const [key, value] of Object.entries(scripts)) {
				assert(pkgjson.scripts[key] === value);
			}

			for (const [key, value] of Object.entries(config)) {
				assert.deepStrictEqual(pkgjson[key], value);
			}

			for (const [filename, expected] of Object.entries(files)) {
				// eslint-disable-next-line no-await-in-loop
				await contains({
					assert,
					read: () => read(filename),
					test: (contents) => assert(contents === expected.trim() + '\n'),
				});
			}
		},

		precondition: async ({readPkg, exists, assert}) => {
			const pkgjson = await readPkg();
			const devDeps = pkg.devDeps(pkgjson);
			for (const dep of deps) assert(!devDeps.has(dep));
			for (const key of Object.keys(scripts)) {
				assert(pkgjson.scripts[key] === undefined);
			}

			for (const key of Object.keys(config)) {
				assert(pkgjson[key] === undefined);
			}

			for (const filename of Object.keys(files)) {
				// eslint-disable-next-line no-await-in-loop
				assert(!(await exists(filename)));
			}
		},

		apply: async ({
			readPkg,
			writePkg,
			read,
			write,
			upgrade,
			fixConfig,
			install,
		}) => {
			await update({
				read: readPkg,
				write: writePkg,
				edit: (pkgjson) => {
					for (const dep of deps) pkg.addDevDep(pkgjson, dep);
					for (const [key, value] of Object.entries(scripts))
						pkgjson.scripts[key] = value;
					for (const [key, value] of Object.entries(config))
						pkgjson[key] = value;
					return pkgjson;
				},
			});
			for (const [filename, contents] of Object.entries(files)) {
				// eslint-disable-next-line no-await-in-loop
				await update({
					create: true,
					overwrite: false,
					read: () => read(filename),
					write: (data) => write(filename, data),
					edit: () => contents.trim() + '\n',
				});
			}

			await upgrade(deps.join(' '));
			await fixConfig();
			await install();
		},
	};
}
