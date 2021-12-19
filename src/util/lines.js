import fs from 'node:fs';
import readline from 'node:readline';

// https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line

const crlfDelay = Number.POSITIVE_INFINITY;

/**
 * IterLines.
 *
 * @param {String} filename
 * @return {AsyncIterable}
 */
export default function lines(filename) {
	const input = fs.createReadStream(filename);
	return readline.createInterface({input, crlfDelay});
}
