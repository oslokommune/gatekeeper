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


<!-- ABOUT THE PROJECT -->
## About the project
This Gatekeeper tries to simplify authentication on an OAuth2 OIDC provider with a web application by implementing 
a few defaults
* Redirects your client to the auth providers /authorize endpoint with needed variables set
* Sets the access token and refresh token as HttpsOnly cookies on the response to the client 
* Exposes a proxy entrypoint to translate a HttpsOnly cookie into an Authorization header

### Built With

* [NodeJS](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [Redis](https://redis.io/)


<!-- GETTING STARTED -->
## Getting started

To run Gatekeeper locally, follow these steps

### Prerequisites

* NodeJS v12.13.0
* NPM

### Installation
 
1. Clone the repo
```sh
git clone https://github.oslo.kommune.no/julius/gatekeeper
```
2. Install NPM packages
```sh
npm install
```

<!-- CONFIGURATION -->
## Configuration
| Variable                        | Description                                                                                             | Example                                                                          |
|---------------------------------|---------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| BASE_URL                        | URL which the Gatekeeper will be listening on                                                           | https://gatekeeper.awesome.com                                                   |
| CLIENT_ID                       | OAuth2 Client ID                                                                                        | Gatekeeper                                                                       |
| CLIENT_SECRET                   | Oauth2 Client secret                                                                                    | 0aadea6c-9e01-43e9-a584-8bb579f0cc43                                             |
| CORS_ORIGINS                    | Origin(s) which the Gatekeeper should accept connections from                                           | https://awesome.com                                                              |
| DISCOVERY_URL                   | OAuth2 OIDC Discovery URL                                                                               | https://keycloak.awesome.com/auth/realms/public/.well-known/openid-configuration |
| ERROR_URL                       | An URL to redirect the client/user to on errors. Should accept status and message as url params         | https://awesome.com/error                                                        |
| REDIS_URL                       | URI for your Redis instance                                                                             | redis://redis.awesome.com                                                        |
| REDIS_PASSWORD                  | Password for your Redis instance                                                                        | secret                                                                           |
| SUCCESSFUL_LOGIN_ORIGIN         | Whitelisted origin where the client can be redirected to on successful login                            | https://awesome.com                                                              |
| SUCCESSFUL_LOGIN_PATHNAME_REGEX | Whitelisted pathname where the client can be redirected to on successful login                          | ^article/[0-9]$                                                                  |
| UPSTREAMS                       | Upstreams to redirect to on /api/*. Gatekeeper will turn a HttpOnly cookie into an Authorization bearer | articles=http://articles.service;writers=http://writers.service                  |
| CERTIFICATE_FILE                | Optional: path to certificate file in case SSL termination is needed/wanted                              | /var/keys/server.crt                                                             |
| KEY_FILE                        | Optional: Path to key file in case SSL termination is needed/wanted                                      | /var/keys/server.key                                                             |
<!-- USAGE EXAMPLES -->

## Usage

1. Generate an env file
```sh
make generate-dotenv-file
```
2. Configure .env file
3. Run the Gatekeeper
```sh
make run
```

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.
