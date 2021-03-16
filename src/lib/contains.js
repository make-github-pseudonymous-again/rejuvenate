const subroutine = ({assert, read, test, mustExist}) =>
	read().then(test, (error) => {
		if (error.code !== 'ENOENT') throw error;
		if (mustExist) assert.fail(error.message);
	});

const contains = (options) => subroutine({mustExist: true, ...options});

export default contains;
