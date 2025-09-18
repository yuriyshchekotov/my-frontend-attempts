.PHONY: newday
.PHOBY: run_blog
DAYS_DIR = data/days

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

run_blog:
	tsx watch src/server/index.ts