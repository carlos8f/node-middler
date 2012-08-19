test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--require test/common.js

bench:
	@cd bench
	@npm install
	@cd ..
	@echo
	@echo "middler"
	@./bench/bench.js middler && echo
	@echo "connect"
	@./bench/bench.js connect && echo
	@echo "union"
	@./bench/bench.js union && echo

.PHONY: test bench