# PARSEC Labs cli tool/library boilerplate

Boilerplate with predefined code style

Includes:

- eslint config
- jest config
- prettier config
- .editorconfig

## Prerequisite

- Node.js 8+
- Yarn

## Setup the new project

- `git clone --origin boilerplate https://github.com/parsec-labs/parsec-cli-boilerplate.git <your-project-name>`
- `git remote origin add git@github.com:parsec-labs/<your-project-name>.git && <your-project-name>`
- change name in `package.json`
- `yarn`
- Enjoy :-)

## Tests

[Jest](https://jestjs.io/) used for unit-testing. Put your test file near module that you want to test. For example, for `src/cool-module.js` you should create a file `src/cool-module.test.js`.

- `yarn test` — run tests
- `yarn test:watch` — run tests in watch mode
