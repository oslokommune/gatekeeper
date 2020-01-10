NAME=`cat package.json | jq .name | cut -d"\"" -f2`
VERSION=`cat package.json | jq .version | cut -d"\"" -f2`
REPOSITORY=container-registry.oslo.kommune.no

run:
	nodemon server.js

certs:
	mkdir sslcerts
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout sslcerts/server.key -out sslcerts/server.crt

generate-dotenv-file:
	echo "BASE_URL=" >> .env
	echo "CLIENT_ID=" >> .env
	echo "CLIENT_SECRET=" >> .env
	echo "CORS_ORIGINS=" >> .env
	echo "DISCOVERY_URL=" >> .env
	echo "ERROR_URL=" >> .env
	echo "REDIS_URL=" >> .env
	echo "REDIS_PASSWORD=#optional" >> .env
	echo "SUCCESSFUL_LOGIN_ORIGIN=" >> .env
	echo "SUCCESSFUL_LOGIN_PATHNAME_REGEX=# default: \/ aka '/'" >> .env
	echo "UPSTREAMS=" >> .env
	echo "CERTIFICATE_FILE=#optional" >> .env
	echo "KEY_FILE=#optional" >> .env

build:
	docker build \
		--tag ${REPOSITORY}/${NAME}:${VERSION} .

run-in-docker:
	docker stop ${NAME} || true
	docker run \
		-d -p 4554:4554 \
		--name ${NAME} \
		--env-file .env-docker \
		${REPOSITORY}/${NAME}:${VERSION}

clean:
	@rm -rf node_modules || true
	@rm -rf sslcert || true

test:
	npm run test
