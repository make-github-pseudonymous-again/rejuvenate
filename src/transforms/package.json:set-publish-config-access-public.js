import addPackageJSONKey from '../recipes/add-package-json-key.js';

const description = 'Set publishConfig access to public.';

const commit = {
	scope: 'package.json',
	subject: description,
};

const key = 'publishConfig';
const value = {
	access: 'public',
};

const dependencies = ['config:lint-setup'];

const {postcondition, precondition, apply} = addPackageJSONKey(key, value);

export {description, commit, postcondition, precondition, apply, dependencies};
