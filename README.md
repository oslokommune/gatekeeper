<!--
*** Source of the README template: https://github.com/othneildrew/Best-README-Template/
*** Thanks for checking out this README Template. If you have a suggestion that would
*** make this better, please fork the repo and create a pull request or simply open
*** an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
***
***
***
*** To avoid retyping too much info. Do a search and replace for the following:
*** github_username, repo, twitter_handle, email
-->


<!-- PROJECT LOGO -->
<br />
<p align="center">
  <img width="160" src="https://ok-origo-developer-portal-gatekeeper.s3.eu-north-1.amazonaws.com/gatekeeper-logo-black.svg" />
  <h3 align="center">Gatekeeper</h3>

  <p align="center">
    Simplifies authentication for web applications with an OAuth2 provder
  </p>
</p>

<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About Gatekeeper](#about-the-project)
  * [Built with](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Configuration](#configuration)
* [Usage](#usage)
	* [docker-compose](#docker-compose)
	* [Docker](#docker)
	* [Standalone](#standalone)


<!-- ABOUT THE PROJECT -->
## About the project
The Gatekeeper is a tool made to simplify authentication against an OAuth2 provider from a web application.

After the Gatekeeper is configured using a minimalistic set of environment variables, all you need to do is make an anchor tag in your frontend that points to the Gatekeeper's /login endpoint and it will handle the rest. The end result is your frontend having the access token and refresh token set as Secure and HttpOnly cookies. To log out you simply POST to the Gatekeeper's /logout endpoint.

If your backend service expects the access token as an authorization header, you can use the proxy functionality which handles setting the cookie as an Authorization header for you. The Gatekeeper will handle refreshing of the access token for requests on any of the exposed entrypoints.
### Why

* We were made aware of the bad practice surrounding storing the access token and refresh token in the local storage of the frontend, and as non-HttpOnly cookies. This is not recommended and is a security risk in the event of a XSS vulnerability.
* In the case of a single page application, the Gatekeeper can handle authentication in a security wise satisfactory way.
* Authentication is decoupled from the frontend / client which will simplify maintenance and creation of new frontends / clients.

### How

The OpenAPI specification can be viewed [here](https://developer.oslo.kommune.no/katalog/api/136/introduction)

The Gatekeeper exposes following entrypoints:

- /login?redirect= redirects the client to the auth provider's login screen and sets what location to redirect to on a successful login
- /logout invalidates the refresh token in the auth provider and clears the client's access and refresh tokens from cookies
- /api/* proxies requests to a configured backend service and sets the access token to a authorization header on the request. This also handles automatically refreshing of the access token. Use the UPSTREAMS environment variable to configure routes.
- /callback used internally by the Gatekeeper and the authorization provider in the Oauth2 authorization code flow. Ignore this when integrating with the Gatekeeper

### Built With

* [NodeJS](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [Redis](https://redis.io/)


<!-- GETTING STARTED -->
## Getting started

To run Gatekeeper locally, follow these steps

### Prerequisites

* NodeJS v12.14.1
* NPM v6.13.6

### Installation

1. Clone the repo
```sh
git clone https://github.oslo.kommune.no/origodigi/gatekeeper
```
2. Install NPM packages
```sh
npm install
```

<!-- CONFIGURATION -->
## Configuration

### Mandatory
| Variable          | Example                                                                                                                                                              | Description                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| BASE_URL          | [https://gatekeeper.awesome.com](https://gatekeeper.awesome.com)                                                                                                     | URL which the Gatekeeper will be listening on                                                          |
| CLIENT_ID         | Gatekeeper                                                                                                                                                           | OAuth2 Client ID                                                                                       |
| CLIENT_SECRET     | 0aadea6c-9e01-43e9-a584-8bb579f0cc43                                                                                                                                 | Oauth2 Client secret                                                                                   |
| DISCOVERY_URL     | [https://keycloak.awesome.com/auth/realms/public/.well-known/openid-configuration](https://keycloak.awesome.com/auth/realms/public/.well-known/openid-configuration) | OAuth2 OIDC Discovery URL                                                                              |
| ORIGIN_WHITELIST  | https://test.awesome.com;http://localhost                                                                                                                            | Legal origins for cors and login redirect. If not specified, each individual origin must be specified. |

### Optional
| Variable                        | Example                                                         | Default          | Description                                                  |
| ------------------------------- | ------------------------------------------------------------    | ---------------- | ------------------------------------------------------------ |
| CORS_ORIGINS                    | https://awesome.com;https://test.awesome.com                    | ORIGIN_WHITELIST | Configure the Access-Control-Allow-Origin header for the Gatekeeper. Should be your frontend origin |
| ERROR_URL                       | https://awesome.com/gatekeepererror                             |                  | An URL to redirect the client/user to on errors. Should accept status and message as URL parameters |
| LOG_LEVEL                       | debug                                                           | error            | How verbose logging should be. Log levels can be seen [here](https://github.com/winstonjs/winston#using-logging-levels) |
| LOG_PRETTY_PRINT                | true                                                            | false            | Pretty print json log output                                 |
| REDIS_PASSWORD                  | secret                                                          |                  | Password for your Redis instance                             |
| REDIS_URI												| redis://redis.awesome.com                                       |                  | URI for your Redis instance. Needed for horizontal scaling   |
| SUCCESSFUL_LOGIN_ORIGINS        | https://awesome.com                                             | ORIGIN_WHITELIST | Whitelisted origin where the client can be redirected to on successful login |
| SUCCESSFUL_LOGIN_PATHNAME_REGEX | ^article/[0-9]$                                                 | /*               | Whitelisted pathname where the client can be redirected to on successful login |
| TOKEN_COOKIES_DOMAIN            | .oslo.kommune.no                                                | BASE_URL         | What domain the tokens should be sent to. Useful if running an SSR setup to send tokens to both the Gatekeeper and the SSR server                            |
| TOKEN_COOKIES_PREFIX            | production_                                                     |                  | Prefix the cookies to prevent name clashes when serving multiple environments on the same domain                           |
| TOKEN_COOKIES_SAMESITE          | lax                                                             | strict           | Sets the samesite attribute for the access and refresh token cookies |
| TOKEN_COOKIES_SECURE            | false                                                           | true             | Sets the secure attribute for the access and refresh token cookies. Neat if you are developing locally |
| UPSTREAMS                       | articles=http://articles.service;writers=http://writers.service |                  | Upstreams to redirect to on /api/*. Gatekeeper will turn a HttpOnly cookie into an Authorization bearer and make sure the token is refreshed when necessary |
| CERTIFICATE_FILE                | /var/keys/server.crt                                            |                  | path to certificate file in case SSL termination is needed/wanted |
| KEY_FILE                        | /var/keys/server.key                                            |                  | Path to key file in case SSL termination is needed/wanted    |
<!-- USAGE EXAMPLES -->

### Horizontal Scaling
To enable horizontal scaling, you need point the gatekeeper(s) to a Redis instance by supplying the REDIS_URI (and optionally REDIS_PASSWORD).

## Usage

### docker-compose
1. Create a .env file and populate it with the variables ```GATEKEEPER_DISCOVERY_URL```, ```GATEKEEPER_CLIENT_ID``` and ```GATEKEEPER_CLIENT_SECRET```
2. Run ```docker-compose up```

### Docker
Configure the environment either individually with -e flags to the docker run command, or use
an env file with --env-file
```sh
docker run -p 4554:4554 docker.pkg.github.com/oslokommune/gatekeeper/gatekeeper:1.0.32
```

### Standalone
1. Generate an env file
```sh
make generate-dotenv-file
```
2. Configure .env file

3. Run the Gatekeeper
```sh
make run
```

