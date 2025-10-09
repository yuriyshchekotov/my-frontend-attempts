SHELL := /bin/bash
DAYS_DIR ?= $(CURDIR)/data/days
.ONESHELL:

.PHONY: install_dependencies
.PHONY: newday, log
.PHOBY: run_blog, check-path
.PHONY: clean reset install build rebuild dev
.PHONY: seed auth-setup auth-test health help

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
reset: clean install
	@echo "🔨 Building with correct sequence..."
	@echo "Building shared package first..."
	@cd shared && rm -rf dist tsconfig.tsbuildinfo && yarn build && cd ..
	@echo "Building storage package..."
	@cd storage && rm -rf dist tsconfig.tsbuildinfo && yarn build && cd ..
	@echo "Building api package..."
	@cd api && rm -rf dist tsconfig.tsbuildinfo && yarn build && cd ..
	@echo "Building frontend package..."
	@cd frontend && rm -rf dist tsconfig.tsbuildinfo && yarn build && cd ..
	@echo "✨ Full reset complete!"

# быстрый старт с авторизацией
dev-auth: auth-setup dev
	@echo "🚀 Development mode with authentication started!"

# запуск в режиме разработки
dev:
	@echo "🚀 Starting development mode with authentication..."
	@echo "Building shared package first..."
	@yarn workspace @frontend-learning/shared build
	@echo "Starting all services in background..."
	@yarn dev:storage &
	@yarn dev:api &
	@yarn dev:frontend &
	@echo "All services started! Check:"
	@echo "  Frontend: http://localhost:3000 (with login/registration)"
	@echo "  API: http://localhost:3001 (with auth endpoints)"
	@echo "  Storage: http://localhost:3002"
	@echo "  API Docs: http://localhost:3001/api-docs"
	@echo ""
	@echo "🔐 Default users:"
	@echo "  Admin: admin / admin123"
	@echo "  Student: student1 / student123"
	@echo ""
	@echo "Press Ctrl+C to stop all services"
	@wait

# запуск в production режиме
start:
	@echo "🚀 Starting production mode with authentication..."
	@echo "Building all services first..."
	@yarn build
	@echo "Starting all services in background..."
	@yarn workspace @frontend-learning/storage start &
	@yarn workspace @frontend-learning/api start &
	@yarn workspace @frontend-learning/frontend start &
	@echo "All services started! Check:"
	@echo "  Frontend: http://localhost:3000 (with login/registration)"
	@echo "  API: http://localhost:3001 (with auth endpoints)"
	@echo "  Storage: http://localhost:3002"
	@echo "  API Docs: http://localhost:3001/api-docs"
	@echo ""
	@echo "🔐 Default users:"
	@echo "  Admin: admin / admin123"
	@echo "  Student: student1 / student123"
	@echo ""
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

# инициализация данных для авторизации
seed:
	@echo "🌱 Initializing authentication data..."
	@cd storage && yarn tsx scripts/seed.ts
	@echo "✔ Seed complete - default users created"

# полная настройка авторизации
auth-setup: build seed
	@echo "🔐 Authentication setup complete!"
	@echo "Default users created:"
	@echo "  Admin: admin / admin123"
	@echo "  Student: student1 / student123"
	@echo ""
	@echo "Start services with: make dev"

# тестирование авторизации
auth-test:
	@echo "🧪 Testing authentication endpoints..."
	@echo "Testing registration..."
	@curl -s -X POST http://localhost:3001/auth/register \
		-H "Content-Type: application/json" \
		-d '{"name":"testuser","password":"test123","confirmPassword":"test123"}' \
		| jq '.' || echo "Registration test failed"
	@echo ""
	@echo "Testing login..."
	@curl -s -X POST http://localhost:3001/auth/login \
		-H "Content-Type: application/json" \
		-d '{"name":"admin","password":"admin123"}' \
		| jq '.' || echo "Login test failed"
	@echo ""
	@echo "Testing protected endpoint..."
	@TOKEN=$$(curl -s -X POST http://localhost:3001/auth/login \
		-H "Content-Type: application/json" \
		-d '{"name":"admin","password":"admin123"}' | jq -r '.data.accessToken'); \
	curl -s -X GET http://localhost:3001/articles \
		-H "Authorization: Bearer $$TOKEN" \
		| jq '.' || echo "Protected endpoint test failed"

# проверка здоровья всех сервисов
health:
	@echo "🏥 Checking health of all services..."
	@echo "Frontend Service:"
	@curl -s http://localhost:3000/health | jq '.' || echo "Frontend not responding"
	@echo ""
	@echo "API Service:"
	@curl -s http://localhost:3001/health | jq '.' || echo "API not responding"
	@echo ""
	@echo "Storage Service:"
	@curl -s http://localhost:3002/health | jq '.' || echo "Storage not responding"

# команда по умолчанию
.DEFAULT_GOAL := help

# справка по командам
help:
	@echo "🔧 Available commands:"
	@echo ""
	@echo "📦 Setup & Build:"
	@echo "  make install     - Install all dependencies"
	@echo "  make build       - Build all services"
	@echo "  make clean       - Clean all build artifacts"
	@echo "  make reset       - Full reset (clean + install + build)"
	@echo ""
	@echo "🔐 Authentication:"
	@echo "  make seed        - Initialize default users (admin/student1)"
	@echo "  make auth-setup  - Full auth setup (build + seed)"
	@echo "  make auth-test   - Test authentication endpoints"
	@echo ""
	@echo "🚀 Development:"
	@echo "  make dev         - Start all services in development mode"
	@echo "  make dev-auth    - Quick start with auth setup"
	@echo "  make start       - Start all services in production mode"
	@echo ""
	@echo "🔍 Monitoring:"
	@echo "  make health      - Check health of all services"
	@echo "  make help        - Show this help"
	@echo ""
	@echo "📝 Legacy:"
	@echo "  make newday      - Create new day directory"
	@echo "  make log         - Start logging session"
	@echo "  make run_blog    - Run legacy blog server"