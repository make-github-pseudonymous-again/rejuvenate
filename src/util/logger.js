const ERROR = 0;
const WARN = 1;
const INFO = 2;
const DEBUG = 3;

const noop = () => {};
const error = console.error.bind(console);
const warn = console.warn.bind(console);
const info = console.info.bind(console);
const debug = console.debug.bind(console);

export default function logger({loglevel}) {
	return {
		ERROR,
		error: loglevel >= ERROR ? error : noop,
		WARN,
		warn: loglevel >= WARN ? warn : noop,
		INFO,
		info: loglevel >= INFO ? info : noop,
		DEBUG,
		debug: loglevel >= DEBUG ? debug : noop,
	};
}
