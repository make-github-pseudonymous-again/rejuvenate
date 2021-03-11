const noop = () => {};
const info = console.info.bind(console);
const debug = console.debug.bind(console);
const error = console.error.bind(console);
const warn = console.warn.bind(console);

export default function logger({loglevel}) {
	return {
		error: loglevel >= 0 ? error : noop,
		warn: loglevel >= 1 ? warn : noop,
		info: loglevel >= 2 ? info : noop,
		debug: loglevel >= 3 ? debug : noop,
	};
}
