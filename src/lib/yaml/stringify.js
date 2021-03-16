import YAML from 'yaml';

const DEFAULT_OPTIONS = {
	indent: 2,
};

const stringify = (object) =>
	YAML.stringify(object, undefined, DEFAULT_OPTIONS);

export default stringify;
