CC = ./compile.sh
BDIR=./benchmark-files
SRCS = $(wildcard $(BDIR)/*.scala)
OBJS = $(patsubst $(BDIR)/%.scala,js-build/%.js,$(SRCS))

all: $(OBJS)

# Compile all scala programs to JS.
js-build/%.js: $(BDIR)/%.scala | js-build
	$(CC) $^ > $@

js-build:
	mkdir -p js-build

.PHONY: clean
clean:
	rm -rf js-build

# Rule to debug variables.
print-%  : ; @echo $* = $($*)
