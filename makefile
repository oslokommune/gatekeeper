NAME ?= `jq -r .name package.json`
VERSION ?= `jq -r .version package.json`
REPOSITORY ?= docker.myrepository.org

help: ## Print this menu
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image
	@echo "🏗 Building ${REPOSITORY}/${NAME}:${VERSION}"
	docker build \
		--tag ${REPOSITORY}/${NAME}:${VERSION} .
	@echo "👷‍ ‍Build complete"

push-image: ## Push image ${REPOSITORY}
	@echo "🚚 Pushing image to ${REPOSITORY}"
	docker push ${REPOSITORY}/${NAME}:${VERSION}
	@echo "🛬 Push complete"

release: build push-image
	@echo "🚀 Release successfully built. We are ready to deploy"

run: ## Run the Gatekeeper locally
	npx nodemon server.js

run-in-docker: ## Run the Gatekeeper in Docker
	docker stop ${NAME} || true
	docker run \
		-d -p 4554:4554 \
		--name ${NAME} \
		--env-file .env-docker \
		${REPOSITORY}/${NAME}:${VERSION}

start-redis: ## Start a Redis instance
	docker run --rm -p 6379:6379 --name redis -d redis

test: ## Run tests
	npm run test

generate-dotenv-file: ## Generate .env file template
	echo "BASE_URL=" >> .env
	echo "CLIENT_ID=" >> .env
	echo "CLIENT_SECRET=" >> .env
	echo "TOKEN_COOKIES_DOMAIN=#optional, default BASE_URL"
	echo "TOKEN_COOKIES_SAMESITE=#optional, default strict"
	echo "TOKEN_COOKIES_SECURE=#optional, default 'true'"
	echo "CORS_ORIGINS=#optional, default ORIGIN_WHITELIST" >> .env
	echo "DISCOVERY_URL=" >> .env
	echo "ERROR_URL=" >> .env
	echo "LOG_LEVEL=#optional, default error" >> .env
	echo "LOG_PRETTY_PRINT=#optional, default false" >> .env
	echo "ORIGIN_WHITELIST=" >> .env
	echo "REDIS_URI=" >> .env
	echo "REDIS_PASSWORD=#optional" >> .env
	echo "SUCCESSFUL_LOGIN_ORIGINS=#optional, default: ORIGIN_WHITELIST" >> .env
	echo "SUCCESSFUL_LOGIN_PATHNAME_REGEX=#optional, default: \/ aka '/'" >> .env
	echo "SUCCESSFUL_LOGOUT_ORIGINS=#optional, default: ORIGIN_WHITELIST" >> .env
	echo "UPSTREAMS=#optional, used if automatic token refresh / cookie to auth header proxy is needed / wanted" >> .env
	echo "CERTIFICATE_FILE=#optional" >> .env
	echo "KEY_FILE=#optional" >> .env

clean: ## Clean up project directory
	@rm -rf node_modules || true
