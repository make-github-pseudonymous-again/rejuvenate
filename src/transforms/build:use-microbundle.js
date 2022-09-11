import update from '../lib/update.js';
import replace from '../lib/text/replace.js';
import * as pkg from '../lib/pkg.js';
import {replaceOrInsert} from '../lib/babel.js';

export const description = 'Configure microbundle to produce build.';

export const commit = {
	type: 'build',
	subject: description,
};

export async function postcondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(!devDeps.has('@babel/cli'));
	assert(devDeps.has('microbundle'));
	assert(pkgjson.bin === undefined);
	assert(pkgjson.main === 'dist/index.cjs');
}

export async function precondition({readPkg, assert}) {
	const pkgjson = await readPkg();
	const devDeps = pkg.devDeps(pkgjson);
	assert(devDeps.has('@babel/cli'));
	assert(!devDeps.has('microbundle'));
	assert(pkgjson.bin === undefined);
	assert(pkgjson.main === 'lib/index.js');
}

export async function apply({
	readPkg,
	writePkg,
	read,
	write,
	remove,
	upgrade,
	fixConfig,
	install,
}) {
	await update({
		read: readPkg,
		write: writePkg,
		edit(pkgjson) {
			pkg.replaceDep(pkgjson, '@babel/cli', 'microbundle');
			pkg.addDevDep(pkgjson, '@babel/plugin-transform-for-of');
			pkg.addDevDep(pkgjson, '@babel/plugin-transform-destructuring');
			pkgjson.source = 'src/index.js';
			pkgjson.main = 'dist/index.cjs';
			pkgjson.module = 'dist/index.module.js';
			pkgjson.esmodule = 'dist/index.modern.js';
			pkgjson['umd:main'] = 'dist/index.umd.js';
			pkgjson.unpkg = 'dist/index.umd.js';
			pkgjson.exports = {
				'.': {
					browser: './dist/index.module.js',
					umd: './dist/index.umd.js',
					require: './dist/index.cjs',
					default: './dist/index.modern.js',
				},
			};
			pkgjson.files = pkgjson.files.map((x) => (x === 'lib' ? 'dist' : x));
			pkgjson.scripts.build = 'NODE_ENV=production microbundle';
			replaceOrInsert(
				pkgjson.babel.env.production,
				'plugins',
				'@babel/plugin-transform-for-of',
			);
			replaceOrInsert(
				pkgjson.babel.env.production,
				'plugins',
				'@babel/plugin-transform-destructuring',
			);
			return pkgjson;
		},
	});
	await replace([['- lib/', () => '- dist/']], ['.codeclimate.yml'], {
		read,
		write,
		method: replace.all,
	});
	await replace([['/lib', () => '/dist']], ['.gitignore'], {
		read,
		write,
		method: replace.all,
	});
	await remove(['lib/**']);
	await upgrade([
		'microbundle',
		'@babel/plugin-transform-for-of',
		'@babel/plugin-transform-destructuring',
	]);
	await fixConfig();
	await install();
}

export const dependencies = [
	'babel:refactor-config',
	'build:microbundle-fix-cjs',
	'codacy:config-remove',
	'config:lint-setup',
	'codeclimate:format-config-file',
];
