SHELL := /bin/bash
DAYS_DIR ?= $(CURDIR)/data/days
.ONESHELL:

.PHONY: install_dependencies
.PHONY: newday, log
.PHOBY: run_blog, check-path
.PHONY: clean reset install build rebuild dev

# список подпроектов
PACKAGES = frontend api storage shared

# удаление node_modules и dist внутри каждого подпроекта
clean:
	@for pkg in $(PACKAGES); do \
		echo "🧹 Cleaning $$pkg..."; \
		rm -rf $$pkg/node_modules $$pkg/dist; \
	done
	@echo "🧹 Removing root artifacts..."
	rm -rf node_modules yarn.lock package-lock.json pnpm-lock.yaml
	@echo "✔ Clean complete"

# установка зависимостей заново
install:
	@echo "📦 Installing dependencies..."
	yarn install --force
	@echo "✔ Install complete"

# билдим все проекты через workspace
build:
	@echo "🔨 Building all workspaces..."
	@echo "Building shared package first..."
	@yarn workspace @frontend-learning/shared build
	@echo "Building other services..."
	@yarn workspaces run build
	@echo "Force rebuilding all services..."
	@for pkg in frontend api storage; do \
		echo "Force building $$pkg..."; \
		cd $$pkg && rm -rf dist tsconfig.tsbuildinfo && npx tsc --build --force && cd ..; \
	done
	@echo "✔ Build complete"

# полный сброс и пересборка
reset: clean install build
	@echo "✨ Full reset complete!"

# запуск в режиме разработки
dev:
	@echo "🚀 Starting development mode..."
	@echo "Starting all services in background..."
	@yarn dev:storage &
	@yarn dev:api &
	@yarn dev:frontend &
	@echo "All services started! Check:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  API: http://localhost:3001"
	@echo "  Storage: http://localhost:3002"
	@echo "Press Ctrl+C to stop all services"
	@wait

# запуск в production режиме
start:
	@echo "🚀 Starting production mode..."
	@echo "Starting all services in background..."
	@yarn workspace @frontend-learning/storage start &
	@yarn workspace @frontend-learning/api start &
	@yarn workspace @frontend-learning/frontend start &
	@echo "All services started! Check:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  API: http://localhost:3001"
	@echo "  Storage: http://localhost:3002"
	@echo "Press Ctrl+C to stop all services"
	@wait

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