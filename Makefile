test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--require test/common.js

bench: install-bench bench-middleware bench-routing

check =										\
	if [ -z `which siege` ]; then						\
		echo "please install siege. http://www.joedog.org/siege-home/";	\
		exit 1;								\
	fi

install-bench:
	@$(call check)
	@npm install
	@cd bench; npm install

bench-middleware: install-bench
	@./node_modules/.bin/benchmarx \
	  --title "middleware" \
		--runner siege \
		bench/middleware/*.js

bench-routing: install-bench
	@./node_modules/.bin/benchmarx \
	  --title "routing" \
		--runner siege \
		--path bench/paths.txt \
		bench/routing/*.js

.PHONY: test bench
