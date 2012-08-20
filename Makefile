test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--bail \
		--require test/common.js

bench:
	@cd bench
	@npm install
	@cd ..
	@echo
	@echo "middleware\n==========" && echo
	@echo "middler\n-------"
	@./bench/bench.js middler && echo
	@echo "connect\n-------"
	@./bench/bench.js connect && echo
	@echo "union\n-----"
	@./bench/bench.js union && echo

	@echo "routes\n======" && echo
	@echo "middler\n-------"
	@./bench/bench.js middler-routes /test/123 && echo
	@echo "express\n-------"
	@./bench/bench.js express-routes /test/123 && echo
	@echo "director\n--------"
	@./bench/bench.js director-routes /test/123 && echo

.PHONY: test bench
