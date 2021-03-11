export default async function update({read, write, edit}) {
	const original = await read();
	const edited = await edit(original);
	await write(edited);
}
