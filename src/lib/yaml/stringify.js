import YAML from 'yaml';

const DEFAULT_OPTIONS = {
	indent: 2,
};

/**
 * Convert object to YAML string.
 *
 * @param {any} object
 * @return {string}
 */
const stringify = (object) =>
	YAML.stringify(object, undefined, DEFAULT_OPTIONS);

export default stringify;
