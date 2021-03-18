import * as pkg from '../lib/pkg.js';
import update from '../lib/update.js';
import contains from '../lib/contains.js';

const addScripts = (options) =>
	subroutine({scripts: {}, deps: [], files: {}, config: {}, ...options});

export default addScripts;

const formatTextFileContents = (string) => string.trim() + '\n';

function* iterFiles(files) {
	for (const [filename, value] of Object.entries(files)) {
		const props = typeof value === 'string' ? {contents: value} : value;
		props.contents = formatTextFileContents(props.contents);
		yield [filename, props];
	}
}

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

			for (const [filename, expected] of iterFiles(files)) {
				// eslint-disable-next-line no-await-in-loop
				await contains({
					assert,
					read: () => read(filename),
					test: (contents) => assert(contents === expected.contents),
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
			for (const [filename, {contents, mode}] of iterFiles(files)) {
				// eslint-disable-next-line no-await-in-loop
				await update({
					create: true,
					overwrite: false,
					read: () => read(filename),
					write: (data) => write(filename, data, {mode}),
					edit: () => contents,
				});
			}

			if (deps.length > 0) await upgrade(deps.join(' '));
			await fixConfig();
			if (deps.length > 0) await install();
		},
	};
}
