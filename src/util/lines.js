import fs from 'fs';
import readline from 'readline';

// https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line

const crlfDelay = Number.POSITIVE_INFINITY;

/**
 * IterLines.
 *
 * @param {String} filename
 * @return {AsyncIterableIterator}
 */
export default function lines(filename) {
	const input = fs.createReadStream(filename);
	return readline.createInterface({input, crlfDelay});
}
