export default function update(options) {
	return subroutine({overwrite: true, create: false, ...options});
}

async function subroutine({read, write, edit, overwrite, create}) {
	let original;
	try {
		original = await read();
		if (!overwrite) throw new Error('file exists');
	} catch (error) {
		if (error.code !== 'ENOENT' || !create) throw error;
	}

	const edited = await edit(original);
	await write(edited);
}
