SHELL := /bin/bash
DAYS_DIR ?= $(CURDIR)/data/days
.ONESHELL:

.PHONY: newday, log
.PHOBY: run_blog, check-path

newday:
	@last_day=$$(ls -d $(DAYS_DIR)/day-* 2>/dev/null | sed 's/.*day-//' | sort -n | tail -1); \
	if [ -z "$$last_day" ]; then \
		next=1; \
	else \
		next=$$(echo $$last_day | awk '{print $$1+1}'); \
	fi; \
	next_padded=$$(printf "%02d" $$next); \
	new_dir="$(DAYS_DIR)/day-$$next_padded"; \
	echo "📦 Создаём папку $$new_dir"; \
	mkdir -p "$$new_dir"

log:
	source $$HOME/.nvm/nvm.sh && script -q -c "node scripts/log-session.js" /dev/null
run_blog:
	tsx watch src/server/index.ts

check-path:
	source $(HOME)/.nvm/nvm.sh && echo $$PATH && which node || echo "node not found"