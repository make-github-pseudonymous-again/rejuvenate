import addScripts from '../recipes/add-scripts.js';

const description = 'Configure workflow to automate build.';

const commit = {
	type: 'config',
	scope: 'github',
	subject: description,
};

const script = 'ci:build';

const scripts = {
	[script]: 'npm run build',
};

const files = {
	[`.github/workflows/${script}.yml`]: `
name: ${script}
on:
  - push
  - pull_request
jobs:
  test:
    name: Continuous integration (build)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Install 🔧
        uses: bahmutov/npm-install@v1
        with:
          install-command: yarn --frozen-lockfile --ignore-scripts
          useRollingCache: true

      - name: Build 🏗️
        run: yarn ${script}
`,
};

const dependencies = ['github:workflow-configure-ci:test'];

const {postcondition, precondition, apply} = addScripts({scripts, files});

export {postcondition, precondition, apply, description, commit, dependencies};
