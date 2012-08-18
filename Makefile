test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--require test/common.js

.PHONY: test
