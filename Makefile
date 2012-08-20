test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--bail \
		--require test/common.js

bench: install-bench bench-middleware bench-routes

check =										\
	if [ -z `which siege` ]; then						\
		echo "please install siege. http://www.joedog.org/siege-home/";	\
		exit 1;								\
	fi

install-bench:
	@$(call check)
	@cd bench; npm install

bench-middleware:
	@echo "middleware\n==========" && echo

	@echo "middler\n-------"
	@sleep 10
	@cd bench; ./bench.js middler && echo
	@echo "union\n-----"
	@sleep 10
	@cd bench; ./bench.js union && echo
	@echo "connect\n-------"
	@sleep 10
	@cd bench; ./bench.js connect && echo

bench-routes:
	@echo "routes\n======" && echo

	@echo "middler\n-------"
	@sleep 10
	@cd bench; ./bench.js middler-routes /test/123 && echo
	@echo "director\n--------"
	@sleep 10
	@cd bench; ./bench.js director-routes /test/123 && echo
	@echo "express\n-------"
	@sleep 10
	@cd bench; ./bench.js express-routes /test/123 && echo

.PHONY: test bench
