NAME=`cat package.json | jq .name | cut -d"\"" -f2`
VERSION=`cat package.json | jq .version | cut -d"\"" -f2`
REPOSITORY=container-registry.oslo.kommune.no

help: ## Print this menu
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image
	docker build \
		--tag ${REPOSITORY}/${NAME}:${VERSION} .
push-image:
	docker push ${REPOSITORY}/${NAME}:${VERSION}
deploy:
	helm --tiller-namespace=developerportal-test --namespace=developerportal-test upgrade \
	--install ${NAME} helm-charts

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
	echo "CORS_ORIGINS=" >> .env
	echo "DISCOVERY_URL=" >> .env
	echo "ERROR_URL=" >> .env
	echo "REDIS_URI=" >> .env
	echo "REDIS_PASSWORD=#optional" >> .env
	echo "SUCCESSFUL_LOGIN_ORIGIN=" >> .env
	echo "SUCCESSFUL_LOGIN_PATHNAME_REGEX=# default: \/ aka '/'" >> .env
	echo "UPSTREAMS=" >> .env
	echo "CERTIFICATE_FILE=#optional" >> .env
	echo "KEY_FILE=#optional" >> .env

clean: ## Clean up project directory
	@rm -rf node_modules || true
