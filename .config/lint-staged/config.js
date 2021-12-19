import {readFile, writeFile} from 'node:fs/promises';

const tsc = async (paths) => {
	const encoding = 'utf8';
	const originalTSConfigPath = 'tsconfig.json';
	// NOTE: MUST be in same directory.
	const lintStagedTSConfigPath = 'lint-staged.tsconfig.json';
	const originalTSConfig = JSON.parse(
		await readFile(originalTSConfigPath, encoding),
	);
	const lintStagedTSConfig = {
		...originalTSConfig,
		include: paths,
	};
	await writeFile(lintStagedTSConfigPath, JSON.stringify(lintStagedTSConfig));
	return `npm run tsc -- --noEmit --project ${lintStagedTSConfigPath}`;
};

const lint = 'npm run lint-and-fix';
const lintConfig = 'npm run lint-config-and-fix';

const config = {
	'*.js': [lint, tsc],
	'package.json': [lintConfig],
};

export default config;
