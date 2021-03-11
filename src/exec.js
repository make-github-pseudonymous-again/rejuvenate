async function run(transform, globals, action) {
	if (transform[action]) {
		await globals.debug(` > ${action}`);
		await transform[action](globals);
	}
}

export default async function exec(transform, {git, ...globals}) {
	await globals.info(`executing ${transform.name}`);
	try {
		await run(transform, globals, 'postcondition');
	} catch (error) {
		if (!(error instanceof globals.assert.AssertionError)) throw error;
	}

	try {
		await run(transform, globals, 'precondition');
	} catch (error) {
		if (error instanceof globals.assert.AssertionError) {
			await globals.debug(` * skipping since precondition not fulfilled`);
			return;
		}

		throw error;
	}

	await run(transform, globals, 'apply');

	await run(transform, globals, 'postcondition');

	// Stage and commit changes
	await git.add('--all');
	const commitMessageLines = [
		transform.commit?.message ||
			`${transform.commit?.emoji || ':robot:'} ${
				transform.commit?.type || 'chore'
			}${transform.commit?.scope ? '(' + transform.commit.scope + ')' : ''}: ${
				transform.commit?.subject || transform.name
			}`,
		transform.description || '',
	];
	await git.commit(commitMessageLines, {
		'--all': true,
	});
}
