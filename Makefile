# ============================================================================
# Apex CallCRM — Developer Workflow
# Run `make help` to see all targets.
# ============================================================================

FRONTEND := Frontend

.PHONY: help install dev build start lint typecheck test test-migrations test-e2e \
        docker-build docker-run graphify ci verify clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install frontend dependencies
	cd $(FRONTEND) && npm install

dev: ## Start dev server on :3000
	cd $(FRONTEND) && npm run dev

build: ## Production build (typecheck + compile)
	cd $(FRONTEND) && npm run build

start: ## Start production server
	cd $(FRONTEND) && npm run start

lint: ## ESLint
	cd $(FRONTEND) && npm run lint

test: ## Unit · security · state-machine tests (vitest)
	cd $(FRONTEND) && npm test

test-migrations: ## Validate DB migrations + RLS + quota triggers against real Postgres
	node scripts/validate-migrations.mjs

test-e2e: ## Playwright browser smoke suite (builds + serves the app)
	cd $(FRONTEND) && npx playwright test

docker-build: ## Build the production Docker image
	docker build -t callcrm:latest $(FRONTEND)

docker-run: ## Run the production image (expects Frontend/.env.production)
	docker run -p 3000:3000 --env-file $(FRONTEND)/.env.production callcrm:latest

graphify: ## Refresh the code knowledge graph
	graphify update .

ci: lint test-migrations test build ## Run everything CI runs, locally

verify: ci test-e2e ## Everything: CI checks + E2E suite

clean: ## Remove build artifacts
	rm -rf $(FRONTEND)/.next $(FRONTEND)/test-results $(FRONTEND)/playwright-report
