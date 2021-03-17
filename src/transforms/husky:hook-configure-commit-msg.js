import addScripts from '../recipes/add-scripts.js';

const description = 'Configure commit-msg hook.';

const commit = {
	type: 'config',
	scope: 'husky',
	subject: description,
};

const scripts = {
	'commit-msg': 'commitlint --edit',
};

const deps = ['@commitlint/cli', '@js-library/commitlint-config'];

const files = {
	'.commitlintrc.js': `
module.exports = {
	extends: ['@js-library']
};
`,
	'.husky/commit-msg': {
		mode: 0o755,
		contents: `
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

function ask () {

	# This is a general-purpose function to ask Yes/No questions in Bash, either
	# with or without a default answer. It keeps repeating the question until it
	# gets a valid answer.

	# http://djm.me/ask

	if [ "\${2:-}" = "Y" ]; then
		prompt="Y/n"
		default=Y
	elif [ "\${2:-}" = "N" ]; then
		prompt="y/N"
		default=N
	else
		prompt="y/n"
		default=
	fi

	while true; do

		# Ask the question (not using "read -p" as it uses stderr not stdout)
		echo -n "$1 [$prompt] "

		# Read the answer (use /dev/tty in case stdin is redirected from somewhere else)
		read REPLY </dev/tty

		# Default?
		if [ -z "$REPLY" ]; then
			REPLY=$default
		fi

		# Check if the reply is valid
		case "$REPLY" in
			Y*|y*) return 0 ;;
			N*|n*) return 1 ;;
		esac

	done

}

while ! npm run commit-msg -- "$1" ; do
	if [ -t 1 ] && ask 'There was an error. Do you wish to amend your commit message?' Y ; then
		\${GIT_EDITOR:-$EDITOR} "$1" < /dev/tty
	else
		exit 1
	fi
done
`,
	},
};

const dependencies = ['config:lint-setup', 'husky:configure'];

const {postcondition, precondition, apply} = addScripts({scripts, deps, files});

export {postcondition, precondition, apply, description, commit, dependencies};
