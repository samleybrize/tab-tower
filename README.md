# Tab Tower

Enhanced tab experience for Firefox.

## Development

### Requirements

  * Firefox Developer Edition 57+
  * [yarn](https://www.npmjs.com/package/yarn)
  * [geckodriver](https://github.com/mozilla/geckodriver)

### Commands

To install dependencies:
```
yarn install
```

To build source code (TypeScript / Sass):
```
yarn build
```

You can use some test functions when building with `NODE_ENV=test yarn build`. Then in the Tab Tower's UI, those functions are available from the browser's console:
  * `addTestTabs(numberOfTabs)`: opens tabs and follow them

To lint source code:
```
yarn lint
```

To open a test browser with the extension installed:
```
yarn start
```

To build the Firefox extension:
```
yarn build-extension:firefox
```

### Tests

To run tests:
```
yarn test
```

To run tests in parallel mode (`X` is the number of slaves):
```
yarn test --parallel X
```

Some screenshots are taken during tests for visual check.
These are stored at `tests/screenshots`.
By default, tests are executed with a headless browser.

The following environment variables are usable:
  * `HEADLESS=0`: execute tests with a visible browser
  * `KEEP_BROWSER=1`: keep the browser opened at the end of the tests (automatically switch `HEADLESS` to `0`)
  * `BROWSER_INSTRUCTION_PORT=x`: tests use socket communication with the browser to send intructions. By default, the socket listen on port 8888. This environment variable allow to change the default port. Note that subsequent port numbers may be used (8889, 8890, ...) when running tests in parallel mode.
  * `URL_DELAYER_PORT=x`: tests use a webserver to simulate slow HTTP requests. By default, the server listen on port 9999. This environment variable allow to change the default port. Note that subsequent port numbers may be used (10000, 10001, ...) when running tests in parallel mode.
